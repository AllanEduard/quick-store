import type {
  ProductFormInput,
  ProductFormValidation,
} from "@/types/inventory";

export function validateProductForm({
  name,
  price,
  groupId,
  newGroupName,
}: ProductFormInput): ProductFormValidation {
  const cleanName = name.trim();
  const cleanPrice = price.trim().replace(",", ".");
  const parsedPrice = Number(cleanPrice);

  if (!cleanName) return { ok: false, error: "Enter a product name." };
  if (!cleanPrice) return { ok: false, error: "Enter a product price." };
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { ok: false, error: "Enter a valid price of 0 or more." };
  }

  return {
    ok: true,
    draft: {
      name: cleanName,
      price: parsedPrice,
      groupId,
      newGroupName,
    },
  };
}
