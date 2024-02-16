// Copyright (c) 2022, Solufy and contributors
// For license information, please see license.txt

frappe.ui.form.on("Matter", {
  refresh: async function (frm, cdt, cdn) {
    const state = frm.doc.workflow_state;

    const type = frm.doc.matter_type;
    frm.toggle_display("category", type === "Litigation");
    frm.set_df_property("category", "reqd", true);

    if (state !== "Draft") {
      frm.toggle_display("amount", true);
      frm.toggle_display("request_to", true);
      frm.set_df_property("amount", "reqd", true);
      frm.set_df_property("request_to", "reqd", true);

      const is_request_sent = await frappe.call({
        method:
          "law_management.law_management.doctype.matter.matter.email_sent",
        args: {
          docname: frm.docname,
        },
      });

      if (is_request_sent.message) {
        view_invoice_request(frm);
      } else {
        toggle_invoice_request(frm);
      }
    }
  },

  frequent_client: (frm) => {
    const checked = frm.doc.frequent_client;

    if (checked) {
      frm.doc.retain_client = 0;
      cur_frm.set_query("client_name", () => {
        return {
          filters: {
            customer_group: ("=", "Frequent"),
          },
        };
      });
      frm.refresh();
    } else {
      cur_frm.set_query("client_name", () => {
        return {};
      });
    }
  },

  retain_client: (frm) => {
    const checked = frm.doc.retain_client;

    if (checked) {
      frm.doc.frequent_client = 0;
      cur_frm.set_query("client_name", () => {
        return {
          filters: {
            customer_group: ("=", "Retain"),
          },
        };
      });
      frm.refresh();
    } else {
      cur_frm.set_query("client_name", () => {
        return {};
      });
    }
  },

  matter_type: (frm) => {
    const type = frm.doc.matter_type;

    frm.toggle_display("category", type === "Litigation");
    frm.set_df_property("category", "reqd", true);

    if (type !== "Litigation") {
      frm.set_value("category", "");
      frm.set_df_property("category", "reqd", false);
    }
  },
});

const view_invoice_request = (frm) => {
  frm.remove_custom_button("Send Invoice Request");
  frm.add_custom_button(__("View Invoice Request"), () => {
    frappe.set_route("Form", "Matter Invoice Request", frm.doc.invoice_request);
  });
};

const toggle_invoice_request = (frm) => {
  frm.add_custom_button(__("Send Invoice Request"), () => {
    const amount = findElement('[data-fieldname="amount"]').querySelector(
      "input"
    ).value;
    const request_to = findElement(
      '[data-fieldname="request_to"]'
    ).querySelector("input").value;

    if (amount == 0) {
      frappe.throw("Amount should be above 0!");
    } else if (!request_to) {
      frappe.throw("Please select the use to send the invoice request to!");
    }

    frappe.call({
      method:
        "law_management.law_management.doctype.matter.matter.open_email_composer",
      args: {
        docname: frm.docname,
        amount: frm.doc.amount,
        description: frm.doc.description,
        client_name: frm.doc.client_name,
        request_to: frm.doc.request_to,
      },
      callback: (response) => {
        frm.set_value("invoice_request", response.message);
        frappe.msgprint("Email sent successfully!");
        view_invoice_request(frm);
      },
    });
  });
};

const findElement = (selector) => document.querySelector(selector);
