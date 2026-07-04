# ClaimGuard — Frontend Assembly Notes

This fork registers the **ClaimGuard** frontend module and adds Docker build support for the Technikali openIMIS Hackathon submission.

**Tag:** `v1.0-hackathon`  
**PR:** [openimis/openimis-fe_js#227](https://github.com/openimis/openimis-fe_js/pull/227)

## Changes in this fork

- `openimis.json` — registers `@openimis/fe-claimguard`
- `package.json` — local file link to `../openimis-fe-claimguard_js`
- `Dockerfile` — copies ClaimGuard module during image build
- `Dockerfile.runtime` — lightweight nginx image for pre-built deployment

Full module source:

**https://github.com/Nosh-thee-techy/openimis-fe-claimguard_js**

## Full stack setup

See **https://github.com/Nosh-thee-techy/openimis-dist_dkr** for Docker Compose instructions.
