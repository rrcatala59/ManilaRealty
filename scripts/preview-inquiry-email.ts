import { renderInquiryAdminEmail } from "../src/utils/inquiry-notification";

const sample = renderInquiryAdminEmail({
  inquiryId: "inq_preview",
  propertyId: "00000000-0000-0000-0000-000000000001",
  propertyTitle: "Laperal Loft at Salcedo",
  name: "Elena Cruz",
  email: "elena@example.com",
  phone: "+63 917 000 0000",
  message: "I would like to view the loft this week, preferably after 4pm.",
  createdAt: new Date().toISOString(),
});

console.log(sample.subject);
console.log("---");
console.log(sample.text);
