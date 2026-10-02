export const socialPreview = {
  path: "/images/social/snie-social-card.png",
  width: 1200,
  height: 630,
  type: "image/png",
}

export function validateSocialPreview({ status, headers = {}, body }) {
  const errors = []
  if (status !== 200) errors.push("social preview: expected HTTP 200")
  if (headers["content-type"]?.split(";")[0].trim().toLowerCase() !== socialPreview.type) errors.push("social preview: expected image/png content type")
  const signature = [137, 80, 78, 71, 13, 10, 26, 10]
  if (!(body instanceof Uint8Array) || body.length < 33 || !signature.every((byte, index) => body[index] === byte)) {
    errors.push("social preview: response is not a PNG image")
    return errors
  }
  const view = new DataView(body.buffer, body.byteOffset, body.byteLength)
  if (String.fromCharCode(...body.slice(12, 16)) !== "IHDR" || view.getUint32(16) !== socialPreview.width || view.getUint32(20) !== socialPreview.height) errors.push("social preview: expected a 1200 × 630 PNG")
  return errors
}
