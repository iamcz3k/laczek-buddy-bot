## Plan

1. **Add the website menu** — place a compact menu button at the top of the pairing page with four options: Home, Commands, How to Use, and About.
2. **Create a Commands page** — organize the supplied command list by category, add command search, category filters, counts, expandable sections, and one-tap copying. Use the existing matte-black visual style and make the long list comfortable on phones.
3. **Create How to Use and About pages** — explain how to pair the bot and run commands, plus a short LACZEK MD overview and the limitation that command availability comes from the connected bot service.
4. **Update Uganda guidance** — change the country-code example beneath the phone field from Pakistan `92` to Uganda `256`.
5. **Navigation and metadata** — provide working links between all four pages and unique page titles/descriptions for Commands, How to Use, and About.
6. **Verify** — check the menu, search/filter/copy actions, page links, and mobile layout in the live preview.

## Technical details

- Store the categorized command names in a shared local data file so the list remains fast and deploys with the site.
- Use separate `/commands`, `/how-to-use`, and `/about` pages, with TanStack Router links.
- No backend changes are required; this adds a command reference to the website and does not alter which commands the upstream WhatsApp bot actually supports.
