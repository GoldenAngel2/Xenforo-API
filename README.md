## Small Xenforo API (Cloudflare Worker)
------------
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/GoldenAngel2/Xenforo-API/)
- The Deploy to Cloudflare button will prompt you with the required information to get the API working for your Xenforo site. 
------------

- This only allows access to two endpoints of Xenforo: 
> - `/api/threads/:id` to fetch a certain thread's information
> - `/api/forums/:id/threads` to fetch a certain forum's threads 

-------

## To view the routes: `https://[example].workers.dev/`

-----

### NOTE: Since I don't have access to a full Xenforo API I can't fully test this out but going from the API docs of Xenforo it should work, if not open an issue request on the repo and I'll try to fix any issues.

#### If you have any suggestions or feedback open an issues request and I'll respond to it. 
