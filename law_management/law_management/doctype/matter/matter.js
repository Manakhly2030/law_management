// Copyright (c) 2022, Solufy and contributors
// For license information, please see license.txt

frappe.ui.form.on("Matter", {
  after_save: async (frm) => {
    const check = await check_assigned_user(frm);

    console.log({ check });

    if (!check) {
      assigned_current_user(frm);
    }
  },

  refresh: async (frm) => {
    const { workflow_state, matter_type } = frm.doc;

    frm.toggle_display("category", matter_type === "Litigation");
    frm.set_df_property("category", "reqd", matter_type === "Litigation");

    if (workflow_state !== "Draft") {
      ["amount", "description", "send_invoice_request"].forEach((field) => {
        frm.toggle_display(field, true);
      });

      const is_request_sent = await frappe.call({
        method:
          "law_management.law_management.doctype.matter.matter.email_sent",
        args: {
          docname: frm.doc.name,
        },
      });

      if (is_request_sent.message) view_invoice_request(frm);
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

  send_invoice_request: (frm) => {
    const { workflow_state } = frm.doc;
    if (workflow_state !== "Draft") {
      toggle_invoice_request(frm);
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

  frm.add_custom_button(__("View Invoice Request"), () => {
    frappe.set_route("Form", "Matter Invoice Request", invoiceRequest);
  });
};

const toggle_invoice_request = (frm) => {
  const validate_invoice_request = () => {
    const amountField = find_element("[data-fieldname='amount']").querySelector(
      "input"
    );
    const descriptionField = find_element(
      "[data-fieldname='description']"
    ).querySelector("textarea");

    const amount = amountField.value;
    const description = descriptionField.value;

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

  validate_invoice_request();
  send_invoice_request();
};

const find_element = (selector) => document.querySelector(selector);

const check_assigned_user = async (frm) => {
  console.log("Matter User: ", frappe.user.has_role("Matter User"));
  console.log("System Manager: ", frappe.user.has_role("System Manager"));
  if (
    frappe.user.has_role("Matter User") &&
    !frappe.user.has_role("System Manager")
  ) {
    const response = await frappe.call({
      method:
        "law_management.law_management.doctype.matter.matter.check_assigned_user",
      args: {
        docname: frm.doc.name,
        user: frappe.session.user,
      },
    });

    return response.message;
  }
  return true;
};

const assigned_current_user = async (frm) => {
  const response = await frm.call({
    method: "frappe.desk.form.assign_to.add",

    args: {
      assign_to: [frappe.session.user],
      doctype: frm.doctype,
      name: frm.docname,
    },
  });

  location.reload();
};
