"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// HTTP biblioteka skirta HTTP serveriams
const http_1 = __importDefault(require("http"));
// Failinės sistemos biblioteka skirta darbui su failais
const fs_1 = __importDefault(require("fs"));
// darbo su keliais biblioteka
const path_1 = __importDefault(require("path"));
//Susikuriame serverio objektą
const server = http_1.default.createServer((req, res) => {
    const method = req.method;
    const url = req.url;
    console.log(`Metodas: ${method}, URL: ${url}`);
    // susigeneruoti nuoroda iki public katalogo
    let filePath = `public${url}`;
    // ar failas egsistuoja
    // fs.existsSync("kelias iki failo") - patikrina ar failas egzistuoja, jei taip - true.
    // fs.lstatSync(filePath).isFile() - patikrina ar tai FileSystemWritableFileStream, ne katalogas, nuoroda, irenginys
    if (fs_1.default.existsSync(filePath) && fs_1.default.lstatSync(filePath).isFile()) {
        console.log(path_1.default.extname(filePath));
        const ext = path_1.default.extname(filePath);
        switch (ext) {
            case ".css":
                res.setHeader("Content-Type", "text/css; charset=utf-8");
                break;
            case ".js":
                res.setHeader("Content-Type", "application/javascript; charset=utf-8");
                break;
            case ".jpg":
            case ".png":
            case ".jpeg":
                res.setHeader("Content-Type", "image/jpg; charset=utf-8");
                break;
        }
        let file = fs_1.default.readFileSync(filePath);
        res.write(file);
        return res.end();
    }
    if (url == '/calculate' && method == 'POST') {
        //Saugomi duomenų "gabalai"
        const reqBody = [];
        //Funkcija kuri iškviečiama kai gaunamas duomenų gabalas
        req.on('data', (d) => {
            console.log(`Gaunami duomenys`);
            console.log(`Duomenys: ${d}`);
            //Kiekvieną duomenų gabalą įdedame į masyvą
            reqBody.push(d);
        });
        //Funkcija kuri iškviečiama kai baigiami siųsti duomenys (visi duomenų gabalai gauti)
        req.on('end', () => {
            console.log(`Baigti siųsti duomenys`);
            //Sujungiame visus gabalus į vieną sąrašą ir paverčiame į string'ą
            const reqData = Buffer.concat(reqBody).toString();
            const va = reqData.split('&');
            const x = parseFloat(va[0].split('=')[1]);
            const y = parseFloat(va[1].split('=')[1]);
            console.log(`Visi gauti duomenys: ${reqData}`);
            console.log(va);
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            //Nuskaitome failą result.html (į buffer tipo kintamąjį, ir paverčiame į stringą)
            let template = fs_1.default.readFileSync('templates/result.html').toString();
            //Pakeičiame tekstą template {{ result }} į suskaičiuotą rezultatą 
            template = template.replace('{{ result }}', `Rezultatas: ${x * y}`);
            res.write(template);
            res.end();
        });
        return;
    }
    if (url == '/') {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        const template = fs_1.default.readFileSync('templates/index.html');
        res.write(template);
        return res.end();
    }
    //Jei puslapis nebuvo rastas
    res.writeHead(404, {
        "Content-Type": "text/html; charset=utf-8"
    });
    const template = fs_1.default.readFileSync('templates/404.html');
    res.write(template);
    return res.end();
});
server.listen(2999, 'localhost');
