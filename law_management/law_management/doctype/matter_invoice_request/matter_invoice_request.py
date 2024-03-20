# Copyright (c) 2024, Solufy and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class MatterInvoiceRequest(Document):
    pass


@frappe.whitelist()
def invoice_sent(to):
    try:
        frappe.sendmail(
            recipients=to,
            subject=frappe._(f'Invoice Request'),
            template='new_notification',
            args=dict(
                body_content=f'<div class="gray-container">Invoice Request for {arguments["docname"]}</div>',
                description=f'<div> <h4>Description: </h4> Please find below the link to the invoice request document</div>',
                doc_link=f"https://hpaliberia.com/app/matter-invoice-request/{invoice_request}"
            ),
        )

    except:
        frappe.throw("Failed to send mail!")
    pass
