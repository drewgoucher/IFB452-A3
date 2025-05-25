import QRCodeStyling from "qr-code-styling";

const inlineSVGDataUrl =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWdlbS1pY29uIGx1Y2lkZS1nZW0iPjxwYXRoIGQ9Ik02IDNoMTJsNCA2LTEwIDEzTDIgOVoiLz48cGF0aCBkPSJNMTEgMyA4IDlsNCAxMyA0LTEzLTMtNiIvPjxwYXRoIGQ9Ik0yIDloMjAiLz48L3N2Zz4=";

export function createQRCodeInstance(data: string): QRCodeStyling {
  return new QRCodeStyling({
    width: 280,
    height: 280,
    data,
    image: inlineSVGDataUrl,
    dotsOptions: {
      color: "#000000",
      type: "rounded",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      imageSize: 0.5,
      margin: 6,
    },
  });
}
