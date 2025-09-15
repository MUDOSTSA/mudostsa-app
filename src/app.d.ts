declare module "svelte-qrcode" {
  import { SvelteComponent } from "svelte";

  interface QrCodeProps {
    value: string;
    size?: number;
    level?: "L" | "M" | "Q" | "H";
    background?: string;
    foreground?: string;
    padding?: number;
  }

  export default class QrCode extends SvelteComponent<QrCodeProps> {}
}
