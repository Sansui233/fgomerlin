mv build-vercel build-vercel-old
mkdir build-vercel
mv build-vercel-old/.git build-vercel/
cp -R build/* build-vercel/
rm -rf build-vercel-old
cd build-vercel
git add .
git commit -m'update'
git push origin master
