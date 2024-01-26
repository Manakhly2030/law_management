// Copyright (c) 2022, Solufy and contributors
// For license information, please see license.txt

frappe.ui.form.on("Matter", {
  refresh: function (frm, cdt, cdn) {
    if (
      frm.doc.workflow_state == "In Progress" ||
      frm.doc.workflow_state == "Approved" ||
      frm.doc.workflow_state == "Closed"
    ) {
      frm.add_custom_button(
        __("Create Sales Invoice"),
        function () {
          frappe.route_options = {
            sales_invoice: frm.doc.sales_invoice,
            status: "Open",
            reference_owner: frm.doc.owner,
          };
          frappe.new_doc("Sales Invoice", {
            customer: cur_frm.doc.client_name,
            payment_type: frm.doc.payment_type,
            item_code: frm.doc.name,
          });
        },
        __("View")
      );
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
});
