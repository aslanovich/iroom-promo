export const phoneHref = (phone: string) => `tel:${phone.replace(/\D/g, "")}`;
