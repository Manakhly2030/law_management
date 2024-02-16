# Copyright (c) 2022, Solufy and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Matter(Document):
	pass


@frappe.whitelist()
def invoice(name):
	print("Docname: ", name)
	doc_invoice = frappe.db.get_value("Sales Invoice Item", {"item_code":name}, "parent")
	print("Invoice: ", doc_invoice)

	return doc_invoice if doc_invoice else None



def validate(self,cdt):
	test_d = frappe.db.get_value("Item",{'name':self.name},'name')
	if not test_d:
		vals = frappe.get_doc({
			"doctype": "Item",
			"name":self.name,
			"item_name":self.matter_name,
			"item_code":self.name,
			"item_group":"All Item Groups"

			})
		# vals.insert()


@frappe.whitelist()
def email_sent(docname):
	return frappe.db.get_value(
		"Matter Invoice Request",
		{"matter_name": docname },
		"matter_name"
		)

@frappe.whitelist()
def open_email_composer(docname, amount, description, client_name, request_to):
	current_date = frappe.utils.now()

	try: 
		frappe.sendmail(
			recipients=request_to,
			subject=f'Invoice Request ({ docname })',
			content=description,
		)
	except:
		frappe.throw("Failed to send mail!")

	
	invoice_request = frappe.new_doc("Matter Invoice Request")
	invoice_request.matter_name = docname
	invoice_request.date = current_date
	invoice_request.amount = amount,
	invoice_request.client_name = client_name
	invoice_request.description = description
	invoice_request.sent_to = request_to
	invoice_request.insert()
	return invoice_request.name





    
	
