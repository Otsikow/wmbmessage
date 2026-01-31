import { MessageChurch } from "@/types/messageChurches";

export const buildChurchAddress = (church: MessageChurch) =>
  [
    church.address_line_1,
    church.address_line_2,
    church.city,
    church.state_region,
    church.postal_code,
    church.country_name,
  ]
    .filter(Boolean)
    .join(", ");

export const buildChurchDetailsPath = (churchId: string) =>
  `/message-churches/${encodeURIComponent(churchId.trim())}`;

export const buildChurchShareDetails = (
  church: MessageChurch,
  options?: {
    baseUrl?: string;
    includeWhatsApp?: boolean;
    mapLink?: string;
  },
) => {
  const address = buildChurchAddress(church);
  const location = [church.city, church.state_region, church.country_name].filter(Boolean).join(", ");
  const baseUrl = options?.baseUrl?.replace(/\/$/, "") ?? "";
  const detailsPath = buildChurchDetailsPath(church.id);
  const detailsUrl = baseUrl ? `${baseUrl}${detailsPath}` : detailsPath;

  const lines = [
    church.church_name,
    address ? `Address: ${address}` : null,
    location ? `Location: ${location}` : null,
    church.pastor_or_contact_name ? `Pastor/Contact: ${church.pastor_or_contact_name}` : null,
    options?.includeWhatsApp && church.whatsapp_number ? `WhatsApp: ${church.whatsapp_number}` : null,
    options?.mapLink ? `Google Maps: ${options.mapLink}` : null,
    `Details: ${detailsUrl}`,
  ].filter(Boolean);

  return {
    title: church.church_name,
    text: lines.join("\n"),
    url: detailsUrl,
  };
};
