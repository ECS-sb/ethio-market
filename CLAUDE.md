# Ethio Market — የሶሻል ሚዲያ አካውንት መሸጫ

## ደንቦች (አትጣስ)
- Next.js App Router + TypeScript strict
- Tailwind + shadcn/ui ብቻ። ጥሬ CSS አትጻፍ።
- ቀለም (ከethiocshub.com ጋር አንድ): ዳራ #000000, አክሰንት #FFBE1A (ግራዲየንት እስከ #FFAA33), ጽሑፍ #F2F2F2, በወርቃማ ላይ ያለ ጽሑፍ #081021
- ራዲየስ rounded-xl, ክፍተት p-6/gap-6, ፊደል Plus Jakarta Sans (ርዕስ), DM Sans (ጽሑፍ), Noto Sans Ethiopic (አማርኛ)
- አዲስ ኮምፖነንት ከመስራት በፊት components/ui ውስጥ ፈልግ
- ሳልፈቅድ ለይአውት አትቀይር
- ጽሑፍ በኮድ ውስጥ አትጻፍ፤ በ lib/messages.ts አስገብተህ በ t() ተጠቀም

## መዋቅር
app/[lang]/ — ገጾች (እንግሊዝኛ ነባሪ፣ አማርኛ /am) | components/ui/ — shadcn
components/ — የእኔ | lib/ — db, auth, session, queries, marketplace, actions, catalog, utils | prisma/ — schema
