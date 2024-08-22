This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

Notandi -> Síða <--> DB <--> vél

## PLAN // TODO **

* Forsíða
	* Navbar með undirsíðum
	* Listi af tendum vélum
	* Um mig 
* Síða vélar
	* Sýnir allar beiðnir
		* Beiðnir eru geimdar í db, {matrix,status,teksta beiðni,?mynd}
		* Gera beiðni // form
* Um verkefni
	* Almennur teksti
	* Tekstur hvers einstaklings

## Bæta við vél

* Setja status allra vekefna sem done
* Eyða beiðni úr db
* Byrja aftur að sækja munstur frá neti ( vegna uppsetningu mun loopa enda þegar engin munztur eru)
* Sækja beint úr db, sleppa bull hugmyndinni minni
* Local og veraldar vefur deila bara db




## COMPLETE
* Búa til schema á admin // serverinn sem keyrir arduino