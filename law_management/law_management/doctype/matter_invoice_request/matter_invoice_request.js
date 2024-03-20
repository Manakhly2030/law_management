// Copyright (c) 2024, Solufy and contributors
// For license information, please see license.txt

frappe.ui.form.on("Matter Invoice Request", {
  async before_submit(frm) {
    const response = await frappe.call({
      method:
        "law_management/doctype/matter_invoice_request/matter_invoice_request.invoice_sent",
      args: {
        to: frm.request_by,
      },
    });

    const sent = response.message;

    if (sent) {
      frappe.msgprint("Invoice has been sent!");
    }
  },
});
