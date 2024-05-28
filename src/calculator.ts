// HTTP biblioteka skirta HTTP serveriams
import http from 'http';

// Failinės sistemos biblioteka skirta darbui su failais
import fs from 'fs';

// darbo su keliais biblioteka
import path from 'path';

//Susikuriame serverio objektą
const server=http.createServer((req,res)=>{
    const method=req.method;
    const url=req.url;
    console.log(`Metodas: ${method}, URL: ${url}`);

    // susigeneruoti nuoroda iki public katalogo
    let filePath = `public${url}`;
    // ar failas egsistuoja
    // fs.existsSync("kelias iki failo") - patikrina ar failas egzistuoja, jei taip - true.
    // fs.lstatSync(filePath).isFile() - patikrina ar tai FileSystemWritableFileStream, ne katalogas, nuoroda, irenginys

    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()){
        console.log(path.extname(filePath));
        const ext=path.extname(filePath);
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
        let file=fs.readFileSync(filePath);
        res.write(file);
        return res.end();
    }

    if (url=='/calculate' && method=='POST'){
        //Saugomi duomenų "gabalai"
        const reqBody:any[]=[];
        //Funkcija kuri iškviečiama kai gaunamas duomenų gabalas
        req.on('data', (d)=>{
            console.log(`Gaunami duomenys`);
            console.log(`Duomenys: ${d}`);
            //Kiekvieną duomenų gabalą įdedame į masyvą
            reqBody.push(d);
        });

        //Funkcija kuri iškviečiama kai baigiami siųsti duomenys (visi duomenų gabalai gauti)
        req.on('end',()=>{
            console.log(`Baigti siųsti duomenys`);
            //Sujungiame visus gabalus į vieną sąrašą ir paverčiame į string'ą
            const reqData=Buffer.concat(reqBody).toString();
            const va=reqData.split('&');
            const x=parseFloat(va[0].split('=')[1]);
            const y=parseFloat(va[1].split('=')[1]);
            console.log(`Visi gauti duomenys: ${reqData}`);
            console.log(va);

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            //Nuskaitome failą result.html (į buffer tipo kintamąjį, ir paverčiame į stringą)
            let template=fs.readFileSync('templates/result.html').toString();
            //Pakeičiame tekstą template {{ result }} į suskaičiuotą rezultatą 
            template=template.replace('{{ result }}',`Rezultatas: ${x*y}`);
            res.write(template);
            res.end();
        });
        return;
    }

    if (url=='/'){
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        const template=fs.readFileSync('templates/index.html');
        res.write(template);
        return res.end();
    }


    //Jei puslapis nebuvo rastas
    res.writeHead(404, {
        "Content-Type":"text/html; charset=utf-8"
    });
   
    const template=fs.readFileSync('templates/404.html');
    res.write(template);
    return res.end();



    
    
});

server.listen(2999,'localhost');