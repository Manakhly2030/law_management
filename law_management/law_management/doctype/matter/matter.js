// Copyright (c) 2022, Solufy and contributors
// For license information, please see license.txt

frappe.ui.form.on("Matter", {
  refresh: async function (frm) {
    const { workflow_state, matter_type } = frm.doc;

    frm.toggle_display("category", matter_type === "Litigation");
    frm.set_df_property("category", "reqd", true);

    if (workflow_state !== "Draft") {
      frm.toggle_display("amount", true);
      frm.set_df_property("amoutnt", "reqd", true);

      const is_request_sent = await frappe.call({
        method:
          "law_management.law_management.doctype.matter.matter.email_sent",
        args: {
          docname: frm.doc.name,
        },
      });

      is_request_sent.message
        ? view_invoice_request(frm)
        : toggle_invoice_request(frm);
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
  const invoiceRequest = frm.doc.invoice_request;
  frm.remove_custom_button("Send Invoice Request");

  frm.add_custom_button(__("View Invoice Request"), () => {
    frappe.set_route("Form", "Matter Invoice Request", invoiceRequest);
  });
};

const toggle_invoice_request = (frm) => {
  const validate_inputs = () => {
    const amountField = frm.fields_dict.amount.$input["0"];
    const descriptionField = frm.fields_dict.description.$input["0"];

    const amount = amountField.value;
    const description = descriptionField.innerText;

    if (amount == 0) {
      frappe.throw("Amount should be above 0!");
    } else if (!description) {
      frappe.throw("Please enter the description!");
    }
  };

  const send_invoice_request = async () => {
    const response = await frappe.call({
      method:
        "law_management.law_management.doctype.matter.matter.send_email_request",
      args: {
        docname: frm.doc.name,
        amount: frm.doc.amount,
        description: frm.doc.description,
        client_name: frm.doc.client_name,
      },
    });

    frm.set_value("invoice_request", response.message);
    frm.save();
    setTimeout(() => frappe.msgprint("Email sent succesfully"), 2000);
    view_invoice_request(frm);
  };

  frm.add_custom_button(__("Send Invoice Request"), () => {
    validate_inputs();
    send_invoice_request();
  });
};
