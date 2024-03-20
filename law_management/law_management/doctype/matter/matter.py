# Copyright (c) 2022, Solufy and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

import json
import ast


class Matter(Document):
    pass


def validate(self, cdt):

    test_d = frappe.db.get_value("Item", {'name': self.name}, 'name')
    if not test_d:
        vals = frappe.get_doc({"doctype": "Item", "name": self.name, "item_name": self.matter_name,
                              "item_code": self.name, "item_group": "All Item Groups"})
        # vals.insert()


@frappe.whitelist()
def email_sent(docname):
    return frappe.db.get_value("Matter Invoice Request", {"matter_name": docname}, "matter_name")


@frappe.whitelist()
def send_email_request(info):

    arguments = json.loads(info)
    arguments["current_date"] = frappe.utils.now()

    email_group = get_email_group("Finance Team")
    invoice_request = create_matter_invoice_request(arguments, email_group)

    try:
        frappe.sendmail(
            recipients=email_group,
            cc=email_group,
            subject=frappe._(f'Invoice Request'),
            template='new_notification',
            args=dict(
                body_content=f'<div class="gray-container">Invoice Request for {arguments["docname"]}</div>',
                description=f'<div><h4>Description: </h4>Please find below the link to the invoice request document</div>',
                doc_link=f"https://hpaliberia.com/app/matter-invoice-request/{invoice_request}"
            ),
        )

    except:
        frappe.throw("Failed to send mail!")

    return invoice_request


def create_matter_invoice_request(arguments, email_group):
    invoice_request = frappe.new_doc("Matter Invoice Request")
    invoice_request.matter_name = arguments["docname"]
    invoice_request.date = arguments["current_date"]
    invoice_request.amount = arguments["amount"],
    invoice_request.client_name = arguments["client_name"]
    invoice_request.description = arguments["description"]
    invoice_request.request_by = arguments["sender"]
    invoice_request.practice_group = arguments["practice_group"]
    invoice_request.sent_to = ", ".join(email_group)
    invoice_request.insert()
    return invoice_request.name


@frappe.whitelist()
def check_assigned_user(docname, user):

    assigned_user = frappe.get_all(
        "Matter", filters={"name": docname}, fields=["_assign", "owner"])

    if not assigned_user[0]._assign:
        return False
    users = ast.literal_eval(assigned_user[0]._assign)

    return False if user in users else True


def get_email_group(name):
    financial_team_filter = {
        "email_group": name
    }

    financial_team_fields = ["email"]

    financial_team_list = frappe.get_all(
        "Email Group Member", filters=financial_team_filter, fields=financial_team_fields)

    return [member['email'] for member in financial_team_list]


def get_email_template():
    return frappe.db.get_value("Email Template", {'name': 'Matter Invoice Request'}, ["response_html"])


def on_trash(self, cdt):
    invoice_request = frappe.db.get_value(
        "Matter Invoice Request", {'name': self.invoice_request}, 'name')

    if invoice_request:
        frappe.delete_doc("Matter Invoice Request", invoice_request)
