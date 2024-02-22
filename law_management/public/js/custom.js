frappe.router.on("change", () => {
  route = frappe.get_route();
  if (route.length == 2 && !frappe.user_roles.includes("System Manager")) {
    console.log(route);
    if (route[0] == "Workspaces") {
      $("#page-Workspaces .page-actions").html("");
    }
  }
});
