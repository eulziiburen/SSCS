import { eq } from "drizzle-orm";
import { db, ensureDb } from "@/db/client";
import { settings } from "@/db/schema";
import { BROCHURE_DEFAULT, BROCHURE_TEMPLATE } from "./brochure-template";

// The brochure's content (text, page order, uploaded photos as data URLs) lives in settings["brochure"].
export const BROCHURE_KEY = "brochure";

// Vercel rejects request bodies over 4.5MB, so saves stay under that with room for headers
export const BROCHURE_MAX_BYTES = 4_000_000;

type BrochureData = { meta: Record<string, unknown>; pages: Record<string, unknown>[] };

export function isBrochureData(v: unknown): v is BrochureData {
  if (!v || typeof v !== "object") return false;
  const d = v as Partial<BrochureData>;
  return (
    !!d.meta && typeof d.meta === "object" &&
    Array.isArray(d.pages) && d.pages.length > 0 &&
    d.pages.every((p) => !!p && typeof p === "object" && typeof (p as { type?: unknown }).type === "string")
  );
}

export async function getBrochureData(): Promise<BrochureData> {
  await ensureDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, BROCHURE_KEY));
  if (row) {
    try {
      const parsed: unknown = JSON.parse(row.value);
      if (isBrochureData(parsed)) return parsed;
    } catch {
      // fall through to the bundled content
    }
  }
  return BROCHURE_DEFAULT as BrochureData;
}

export async function saveBrochureData(data: BrochureData) {
  await ensureDb();
  const value = JSON.stringify(data);
  await db.insert(settings).values({ key: BROCHURE_KEY, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
}


// Public page: view only, so the editing and download buttons are hidden.
const VIEW_EXTRA = `<style>#btnMode,#btnSave,#btnDl,#draftBanner{display:none!important}</style>`;

// Admin page: the brochure's editor calls claude.use("artifact").publish(html) to save and
// claude.use("downloads").save() to download. This stand-in sends the edited JSON to
// /st-admin/brochure instead, and downloads through the browser.
const ADMIN_EXTRA = `<script>
(function(){
  var A='<script type="application/json" id="book-data">';
  function extract(html){var i=html.indexOf(A);if(i<0)throw new Error('no data');i+=A.length;return html.slice(i,html.indexOf('<\\/script>',i)).replace(/\\\\u003c/g,'<')}
  function fail(code,message){var e=new Error(message);e.code=code;return e}
  var artifact={publish:function(html){
    var body;try{body=extract(html)}catch(e){return Promise.reject(fail('invalid_content','Өгөгдөл олдсонгүй'))}
    return fetch('/st-admin/brochure',{method:'POST',headers:{'content-type':'application/json'},body:body,credentials:'same-origin'}).then(function(r){
      if(r.status===401)throw fail('not_writer','Нэвтрэх шаардлагатай');
      if(r.status===413)throw fail('too_large','Хэт том');
      if(!r.ok)throw fail('upstream_error','Хадгалж чадсангүй');
      try{localStorage.removeItem('softtravel-draft')}catch(e){}
      setTimeout(function(){location.reload()},700);
      return {version:'saved'};
    });
  }};
  var downloads={save:function(req){
    var blob=req.data instanceof Blob?req.data:new Blob([req.data],{type:'text/html'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=req.filename||'soft-travel.html';
    document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000);
    return Promise.resolve({status:'saved'});
  }};
  window.claude={use:function(n){return Promise.resolve(n==='artifact'?artifact:n==='downloads'?downloads:null)}};
  // The flipbook builds its toolbar after this script runs, so wait for it to appear
  var tries=0;
  (function addLinks(){
    var top=document.querySelector('.top');
    if(!top){if(++tries<100)setTimeout(addLinks,50);return}
    var mk=function(href,text,target){var a=document.createElement('a');a.href=href;a.textContent=text;a.className='btn';if(target)a.target=target;return a};
    top.insertBefore(mk('/soft-travel','Сайт дээр харах ↗','_blank'),top.querySelector('#btnMode'));
    top.insertBefore(mk('/st-admin','← Admin'),top.firstChild.nextSibling);
  })();
})();
</script>`;

function render(data: BrochureData, extra: string) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return BROCHURE_TEMPLATE.replace("<!--BROCHURE_EXTRA-->", () => extra).replace("__BROCHURE_DATA__", () => json);
}

export const renderPublicBrochure = (data: BrochureData) => render(data, VIEW_EXTRA);
export const renderAdminBrochure = (data: BrochureData) => render(data, ADMIN_EXTRA);
