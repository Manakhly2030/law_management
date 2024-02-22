# Copyright (c) 2022, Solufy and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

import json
import ast

invoice_request_sent_to = "ebrowne@kwagei.com"

class Matter(Document):
	pass


def validate(self,cdt):
	test_d = frappe.db.get_value("Item",{'name':self.name},'name')
	if not test_d:
		vals = frappe.get_doc({"doctype": "Item","name":self.name,"item_name":self.matter_name,"item_code":self.name,"item_group":"All Item Groups"})
		# vals.insert()

@frappe.whitelist()
def email_sent(docname):
	return frappe.db.get_value("Matter Invoice Request",{"matter_name": docname },"matter_name")

@frappe.whitelist()
def send_email_request(docname, amount, description, client_name):
	current_date = frappe.utils.now()

	try: 
		frappe.sendmail( recipients=invoice_request_sent_to ,subject=f'Invoice Request ({ docname })',content=description)
	except:
		frappe.throw("Failed to send mail!")

	invoice_request = frappe.new_doc("Matter Invoice Request")
	invoice_request.matter_name = docname
	invoice_request.date = current_date
	invoice_request.amount = amount,
	invoice_request.client_name = client_name
	invoice_request.description = description
	invoice_request.sent_to = invoice_request_sent_to 
	invoice_request.insert()
	return invoice_request.name

@frappe.whitelist()
def check_assigned_user(docname, user):

	assigned_user = frappe.get_all("Matter",filters={"name":docname}, fields=["_assign", "owner"])

	if not assigned_user[0]._assign:
		return False
	users = ast.literal_eval(assigned_user[0]._assign)

	return False if user in users and user == assigned_user[0].owner else True


		