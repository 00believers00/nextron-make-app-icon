import { app, dialog, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import fs from 'fs';
import * as sharp from 'sharp';
import * as png2icons from 'png2icons'
import * as AndroidList from './assets/android.list';
import * as IosList from './assets/ios.list';
import * as DataContents from './assets/contents';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

let mainWindow;

(async () => {
  await app.whenReady();

  mainWindow = createWindow('main', {
    width: 1000,
    height: 700,
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on("app:open:location", async (event, arg) => {
  const {canceled, filePaths} = await dialog.showOpenDialog({
      properties: ['openDirectory']
  });

  if (canceled === false) {
    mainWindow.webContents.send('app:close:location', filePaths);
    
  }
});

ipcMain.on("app:open:save", async (event, pathLocation, pathImage) => {

  const androidList = AndroidList.list();
  for(let i=0; i < androidList.length; i++){
    const {filename, path, width, height} = androidList[i];
    const dir = pathLocation + "/logo" + path;
    await makeImageFile(pathImage, dir, filename, width, height);
  }

  const iosList = IosList.list();
  for(let i=0; i < iosList.length; i++){
    const {filename, path, width, height} = iosList[i];
    const dir = pathLocation + "/logo" + path;
    await makeImageFile(pathImage, dir, filename, width, height);
  }
  await copyFileContents(pathLocation)

  await makeIcon(pathLocation + "/logo/electron/resources", pathImage);
  mainWindow.webContents.send('app:close:save');
});


const makeIcon =  (dir, pathImage)=>{
  return new Promise(async (resolve, reject)=>{
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }

    fs.readFile(pathImage,(err, input)=>{
      if(err) return;
    // Apple ICNS with bilinear interpolation and no color reduction.
    var output = png2icons.createICNS(input, png2icons.BILINEAR, 0);
    if (output) {
        fs.writeFileSync(dir+"/icon.icns", output);
        
    }
  
    var output = png2icons.createICO(input, png2icons.BEZIER, 20, true);
    fs.writeFileSync(dir + "/icon.ico", output);
    resolve("Success")
    })
    
  })

}

//require image file 1536x1536
const makeImageFile = (inputFile, dir, filename, width, height)=>{
  return new Promise(async (resolve, reject)=>{
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
      }
      sharp(inputFile).resize({width, height}).toFile(dir + filename)
          .then(function (newFileInfo) {
              // newFileInfo holds the output file properties
              console.log("Success: "+dir + " " +filename)
              resolve("")
          })
          .catch(function (err) {
              console.log("Error occured");
          });
    });
  
}

const copyFileContents = (path) =>{
  return new Promise(async (resolve, reject)=>{
    await fs.writeFileSync(
      path+"/logo/ios/AppIcon.appiconset/Contents.json", 
      JSON.stringify(DataContents.data)); 
      resolve("Success");
  })
}


