local args = ngx.req.get_post_args()
if args['txtUserName'] and ngx.status == 302 then
  ngx.log(ngx.INFO, "CACHED USER: "..args['txtUserName'].." FOR SESS "..ngx.var["cookie_ASP.NET_SessionId"])
  ngx.shared.sessions:safe_set(ngx.var["cookie_ASP.NET_SessionId"], args['txtUserName'], 43200)
end
