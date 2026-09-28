"use client";

import Link from "next/link";
import { deleteHotel, saveHotel } from "@/app/st-admin/actions";
import { HOTEL_AMENITIES, HOTEL_CATEGORIES, HOTEL_CATEGORY_MN, type Hotel, type HotelAmenity } from "@/lib/places";
import { imageUrl } from "../TourVisual";
import { ConfirmButton, SubmitButton } from "./Controls";
import { useFormAction } from "./useFormAction";
import { ImageField } from "./ImageField";

const AMENITY_MN: Record<HotelAmenity, string> = { wifi: "Wi-Fi", breakfast: "Өглөөний цай", restaurant: "Ресторан", parking: "Зогсоол", hotwater: "24 цагийн халуун ус", pool: "Усан сан", spa: "Спа", shuttle: "Онгоцны буудлын тээвэр" };

export function HotelForm({ hotel: h, regions }: { hotel?: Hotel; regions: { code: string; name: string }[] }) {
  const { state, action, key } = useFormAction(saveHotel);
  // After a failed save the submitted values win, so nothing the admin typed is lost
  const d: Record<string, string> = state?.values ?? {
    name: h?.name ?? "",
    nameEn: h?.nameEn ?? "",
    regionCode: h?.regionCode ?? "ulaanbaatar",
    city: h?.city ?? "",
    cityEn: h?.cityEn ?? "",
    stars: String(h?.stars ?? 3),
    category: h?.category ?? "a",
    pricePerNight: h ? String(h.pricePerNight) : "",
    description: h?.description ?? "",
    descriptionEn: h?.descriptionEn ?? "",
    amenities: (h?.amenities ?? ["wifi", "breakfast"]).join(","),
    published: h ? (h.published ? "on" : "") : "on",
  };
  const amenities = d.amenities.split(",");

  return (
    <>
      {state?.error && (
        <p className="a-alert" role="alert">
          {state.error}
        </p>
      )}
      <form action={action} className="a-form" key={key}>
        {h && <input type="hidden" name="id" value={h.id} />}
        <section className="a-card">
          <h2>Үндсэн мэдээлэл</h2>
          <div className="field">
            <label htmlFor="name">Нэр</label>
            <input id="name" name="name" defaultValue={d.name} required maxLength={160} />
          </div>
          <div className="a-grid3">
            <div className="field">
              <label htmlFor="regionCode">Аймаг / нийслэл</label>
              <select id="regionCode" name="regionCode" defaultValue={d.regionCode}>
                {regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Хот / сум</label>
              <input id="city" name="city" defaultValue={d.city} required placeholder="Улаанбаатар" />
            </div>
            <div className="field">
              <label htmlFor="pricePerNight">Шөнийн үнэ, нэг өрөө (₮)</label>
              <input id="pricePerNight" name="pricePerNight" type="number" min={1} defaultValue={d.pricePerNight} required />
            </div>
          </div>
          <div className="a-grid3">
            <div className="field">
              <label htmlFor="category">Зэрэглэл</label>
              <select id="category" name="category" defaultValue={d.category}>
                {HOTEL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {HOTEL_CATEGORY_MN[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="stars">Од</label>
              <select id="stars" name="stars" defaultValue={d.stars}>
                <option value="0">Одгүй</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)} ({n})
                  </option>
                ))}
              </select>
            </div>
            <label className="a-check">
              <input type="checkbox" name="published" defaultChecked={d.published === "on"} /> Сайт дээр нийтлэх
            </label>
          </div>
          <div className="field">
            <label htmlFor="description">Тайлбар</label>
            <textarea id="description" name="description" rows={4} defaultValue={d.description} />
          </div>
        </section>

        <section className="a-card">
          <h2>Үйлчилгээ</h2>
          <div className="a-checks">
            {HOTEL_AMENITIES.map((a) => (
              <label key={a} className="a-check">
                <input type="checkbox" name="amenities" value={a} defaultChecked={amenities.includes(a)} /> {AMENITY_MN[a]}
              </label>
            ))}
          </div>
        </section>

        <section className="a-card">
          <h2>Зураг</h2>
          <ImageField name="image" label="Жагсаалт болон дэлгэрэнгүй хуудсанд харагдана" currentUrl={h?.imageId ? imageUrl(h.imageId) : null} />
        </section>

        <section className="a-card">
          <div>
            <h2>English</h2>
            <p className="a-hint">Сайтыг EN хэлээр үзэхэд харагдана. Хоосон үлдээвэл монгол текст гарна.</p>
          </div>
          <div className="a-grid3">
            <div className="field a-span2">
              <label htmlFor="nameEn">Name</label>
              <input id="nameEn" name="nameEn" lang="en" defaultValue={d.nameEn} />
            </div>
            <div className="field">
              <label htmlFor="cityEn">City</label>
              <input id="cityEn" name="cityEn" lang="en" defaultValue={d.cityEn} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="descriptionEn">Description</label>
            <textarea id="descriptionEn" name="descriptionEn" lang="en" rows={3} defaultValue={d.descriptionEn} />
          </div>
        </section>

        <div className="a-actions">
          <Link href="/st-admin/hotels" className="btn ghost">
            Болих
          </Link>
          <SubmitButton>{h ? "Хадгалах" : "Буудал нэмэх"}</SubmitButton>
        </div>
      </form>

      {h && (
        <section className="a-card a-danger-zone">
          <div>
            <h2>Буудал устгах</h2>
            <p>Устгасныг сэргээх боломжгүй. Түр нуух бол “Сайт дээр нийтлэх”-ийг болиулна уу.</p>
          </div>
          <form action={deleteHotel}>
            <input type="hidden" name="id" value={h.id} />
            <ConfirmButton message={`“${h.name}”-г устгах уу?`}>Устгах</ConfirmButton>
          </form>
        </section>
      )}
    </>
  );
}
