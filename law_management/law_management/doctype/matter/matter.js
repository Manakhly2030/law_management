// Copyright (c) 2022, Solufy and contributors
// For license information, please see license.txt

frappe.ui.form.on("Matter", {
  refresh: async function (frm, cdt, cdn) {
    const state = frm.doc.workflow_state;

    if (state !== "Draft") {
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
        frm.add_custom_button(__("Send Invoice Request"), () => {
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

    if (type !== "Litigation") {
      frm.set_value("category", "");
    }
  },
});

const view_invoice_request = (frm) => {
  console.log(frm.doc.invoice_request);
  frm.remove_custom_button("Send Invoice Request");
  frm.add_custom_button(__("View Invoice Request"), () => {
    frappe.set_route("Form", "Matter Invoice Request", frm.doc.invoice_request);
  });
};
// frappe.route_options = { customer_type: "Company" };

// frappe.set_route("List", "Customer", { customer_name: "US Embassy" });
// frappe.route_options = {
//   sales_invoice: frm.doc.sales_invoice,
//   status: "Open",
//   reference_owner: frm.doc.owner,
// };

// frappe.new_doc("Sales Invoice", {
//   customer: cur_frm.doc.client_name,
//   payment_type: frm.doc.payment_type,
//   item_code: frm.doc.name,
// });
// frappe.new_doc("Matter Invoice Request", {
// matter_name: docname,
// });
// frappe.new_doc("Matter Invoice Request", {
//   matter_name: cur_frm.doc.docname,
//   date: fra,
//   item_code: frm.doc.name,
// });

// refresh: function (frm, cdt, cdn) {
//   console.log(frm.doc.sales_invoice);
//   if (
//     frm.doc.workflow_state == "In Progress" ||
//     frm.doc.workflow_state == "Approved" ||
//     frm.doc.workflow_state == "Closed"
//   ) {
//     frm.add_custom_button(
//       __("Create Sales Invoice"),
//       function () {
//         // frappe.route_options = {
//         //   sales_invoice: frm.doc.sales_invoice,
//         //   status: "Open",
//         //   reference_owner: frm.doc.owner,
//         // };
//         frappe.new_doc("Sales Invoice", {
//           customer: cur_frm.doc.client_name,
//           payment_type: frm.doc.payment_type,
//           item_code: frm.doc.name,
//         });
//       },
//       __("View")
//     );
//   }
// },

// console.log(request_sent);

// frm.add_custom_button(__("Send Invoice Request"), function () {
//   frappe.call({
//     method:
//       "law_management.law_management.doctype.matter.matter.open_email_composer",
//     args: {
//       docname: frm.docname,
//       amount: frm.doc.amount,
//       description: frm.doc.description,
//       client_name: frm.doc.client_name,
//     },
//     callback: function (response) {
//       frm.remove_custom_button("Send Invoice Request");
// frm.add_custom_button(__("View Invoice Request"), () => {
//   frappe.set_route(
//     "Form",
//     "Matter Invoice Request",
//     response.message
//   );
// });
//       frappe.msgprint("Email sent successfully!");
//     },
//   });
// });
