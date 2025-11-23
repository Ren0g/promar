# Promar – Next.js web stranica

Ovo je kompletan Next.js projekt za web stranicu Promar.

## 1. Pokretanje lokalno

```bash
npm install
npm run dev
```

Otvoriti: http://localhost:3000

## 2. Build za produkciju

```bash
npm run build
npm start
```

## 3. GitHub repo (Ren0g / promar)

Repozitorij: https://github.com/Ren0g/promar

Ako repo još nije inicijaliziran lokalno, u rootu projekta pokreni:

```bash
git init
git add .
git commit -m "Initial Promar Next.js setup"
git branch -M main
git remote add origin https://github.com/Ren0g/promar.git
git push -u origin main
```

Nakon ovoga je kod na GitHubu i spreman za povezivanje na Vercel.

## 4. Deploy na Vercel

1. Prijavi se na https://vercel.com (GitHub login).
2. Klikni **"Add New..." → "Project"**.
3. Odaberi repo: **Ren0g/promar**.
4. Vercel će automatski prepoznati Next.js.
5. Build postavke:
   - Build command: `npm run build`
   - Output directory: `.next` (default, ne treba mijenjati)
6. Klikni **Deploy**.

Nakon deploya dobit ćeš npr. URL: `https://promar.vercel.app`.

### 4.1. Povezivanje domene promar.hr na Vercel

Na Vercel projektu:

1. Project → Settings → Domains.
2. Dodaj domenu: `promar.hr`.

Vercel će prikazati DNS zapise koje trebaš dodati kod svog domain providera (A zapis + eventualni TXT zapis).

Nakon što DNS propagira, `https://promar.hr` će pokazivati na Vercel deploy.

## 5. Supabase (opcionalno)

Ako kasnije želiš da kontakt forma sprema podatke u bazu ili šalje emailove putem Supabase edge funkcija:

1. Kreiraj projekt na https://supabase.com
2. Napravi tablicu, npr. `contact_messages`:
   ```sql
   create table contact_messages (
     id uuid primary key default gen_random_uuid(),
     name text,
     email text,
     phone text,
     service text,
     message text,
     created_at timestamptz default now()
   );
   ```
3. U projekt instaliraj klijenta:
   ```bash
   npm install @supabase/supabase-js
   ```
4. Napravi npr. `lib/supabaseClient.js` i koristi ga u API rutama ili server akcijama za spremanje poruka.

Trenutno kontakt forma radi klijentski (validacija + poruka o uspješnom slanju), bez spremanja u bazu – site je potpuno funkcionalan i bez Supabasea. Supabase je čisto dodatna opcija za kasnije proširenje.

---

Sve tekstove, linkove i kontakt podatke možeš uređivati direktno u datotekama unutar `app/` i `components/`.