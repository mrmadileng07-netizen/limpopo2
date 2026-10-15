# RoadRescue competition demo

1. Connect the laptop and phones to the same Wi-Fi network.
2. Double-click `run-server.bat` on the laptop and leave its window open. If it was already running before an update, press Ctrl+C in that window and start it again.
3. On the laptop, open `http://localhost:8000/admin.html`.
4. On each phone, open the `http://...:8000/` address printed in the server window.
5. Submit a request from a phone. It should appear on the laptop dashboard within five seconds.

The admin page asks for a department and the shared PIN `1504`. Each service has a filtered dashboard URL; after choosing a service, use **Copy this department dashboard link** to share it. A request appears in the inbox matching the service chosen on its form, and the count shows how many requests it contains. This in-browser PIN is only a competition convenience and does not provide secure staff authentication.

The dashboard's today, week, month, and year totals follow the currently selected service. Use **Download PDF** on a request row to save the request details and any uploaded JPEG photo as a PDF. The photo also appears as a thumbnail in the admin request table.

If Windows Firewall asks, allow Python on **Private networks**. The server saves requests in `roadrescue-requests.json` beside the website files. Keep the server window open during the demo.

This no-login server is for a trusted local competition network only; anyone on that network can view and change requests. Do not expose it to the public internet or use it for real emergency requests. The protected Supabase setup in [PUBLIC-HOSTING.md](PUBLIC-HOSTING.md) requires admin authentication.
