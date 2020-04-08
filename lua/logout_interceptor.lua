local sess=ngx.var["cookie_ASP.NET_SessionId"]
if not sess then
  ngx.log(ngx.INFO, "NO ASP.NET_SessionId")
  return ngx.redirect("/")
end
local user=ngx.shared.sessions:get(sess)
if not user then
  ngx.log(ngx.INFO, "NO USER FOR ASP.NET_SessionId ".. sess)
  return ngx.redirect("/")
end
ngx.log(ngx.INFO, "Logout "..user)
ngx.shared.sessions:delete(sess)