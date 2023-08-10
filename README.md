# Forest Admin POC

### Up and Run
```bash
git checkout development
npm run start:watch
```

### Update prod environment url
```bash
forest environments:update --environmentId 138378 -u https://bf8a-93-175-234-109.ngrok-free.app
```

### Update stage environment url
```bash
forest environments:update --environmentId 139891 -u https://2826-93-175-234-109.ngrok-free.app
```

### Get prod environment config
```bash
forest environments:get 138378
```



