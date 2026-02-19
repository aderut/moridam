import ProductClient from "./ProductClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const p = typeof (params as any)?.then === "function" ? await (params as any) : params;
  const id = p?.id || "";

  return <ProductClient id={id} />;
}
