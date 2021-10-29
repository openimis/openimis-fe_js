# Sync file
# Requires
# - YARN
# - Nodes
# - GIT

$base = "../"
$branch = "develop"
#$repos = "openimis-fe-contract_js", "openimis-fe-calculation_js"
$repos =  "openimis-fe-contribution_plan_js","openimis-fe-admin_js"
$fe_target  = "C:\inetpub\wwwroot\IMIs_formalSector\Front"

# create base if not existing
if ( -Not (Test-Path -Path $base) ){
	mkdir $base
}
# create target if not existing
if ( -Not (Test-Path -Path $fe_target) ){
	mkdir $fe_target
}

cd $base

if ( -Not (Test-Path -Path openimis-fe_js) ){
	git clone https://github.com/openimis/openimis-fe_js.git --quiet
}
cd openimis-fe_js
# get the other file from git
git checkout $branch --quiet -f
git pull --quiet
cd ..
$repos | ForEach-Object  -Process {

	# FIXMEfetch the repository if not existing
	if ( -Not (Test-Path -Path $_ )){
		git clone https://github.com/openimis/$_.git --quiet
	}
	# get the other file from git
	cd $_
	git checkout $branch --quiet -f
	git pull --quiet
	# do the yarn link
	yarn build
	cd ..
}

# build the front end

cd openimis-fe_js

node openimis-config.js ./openimis.fs.json
Get-Content ./modules-unlinks.txt | Invoke-Expression
Get-Content ./modules-removes.txt | Invoke-Expression
Get-Content ./modules-installs.txt | Invoke-Expression
Get-Content ./modules-links.txt | Invoke-Expression
yarn install
yarn build

Remove-Item  $fe_target/* -Recurse -Force
Copy-Item ./build/* $fe_target/ -Recurse -Force


