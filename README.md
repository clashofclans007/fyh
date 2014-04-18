torrent-manager
===============

# Disclaimer

There are obvious legal issues, with downloading copyrighted material you do not have a license for. We do not endorse such use cases and take no responsibility for the use people make of it.

## Gereksinimler

* node.js (0.10.16)
* rar dosyalarını çözümlemek için komut satırından çalışan unrar uygulaması.
* Altyazı dosyalarının karakterlerini çözümlemek için libicu paketine ihtiyaç var. Bunla alakalı kurulum için https://github.com/mooz/node-icu-charset-detector projesinin açıklamalarına göz atılmalı.
* transmission-daemon

## Kurulum

Node.js bağımlılıklarının kurulumu:
```bash
$ npm install
```

Transmission:
```bash
$ transmission-daemon -t -u username -v password
```

Sunucunun çalıştırılması:
```bash
$ cp config.js.sample config.js
$ nohup node server.js > output.log &
```

### Mac OS X Setup

Homebrew kullananlar için:
```bash
$ brew install transmission
$ brew install unrar
$ brew install icu4c
$ ln -s /usr/local/Cellar/icu4c/<VERSION>/bin/icu-config /usr/local/bin/icu-config
$ ln -s /usr/local/Cellar/icu4c/<VERSION>/include/unicode /usr/local/include
```