torrent-manager
===============

Gereksinimler:
* node.js (0.10.16)
* rar dosyalarını çözümlemek için komut satırından çalışan unrar uygulaması.
* Altyazı dosyalarının karakterlerini çözümlemek için libicu paketine ihtiyaç var. Bunla alakalı kurulum için https://github.com/mooz/node-icu-charset-detector projesinin açıklamalarına göz atılmalı.

### Mac ortamı için gereksinimlerin kurulum

Homebrew kullananlar için:
```bash
$ brew install unrar
$ brew install icu4c
$ ln -s /usr/local/Cellar/icu4c/<VERSION>/bin/icu-config /usr/local/bin/icu-config
$ ln -s /usr/local/Cellar/icu4c/<VERSION>/include/unicode /usr/local/include
```

Bağımlılıkların kurulumu:
```bash
$ npm install
```

Sunucunun çalıştırılması:
```bash
$ nohup node server.js > output.log &
```