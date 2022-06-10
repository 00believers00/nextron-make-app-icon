import React from 'react';
import {ipcRenderer} from 'electron'
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {DropzoneArea} from 'material-ui-dropzone';

const useStyles = makeStyles({
    button: {
        margin: 10
    },
    textHiden:{
      color:"#9f9ca5"
    },
    rowStart:{
      width:"100%",
      flexDirection:"row",
      justifyItems:"start"
    }
});

function Home() {
    const classes = useStyles();

    const [selectFile, setSelectFile] = React.useState<File>(null);
    const [sizeImageText, setSizeImageText] = React.useState("");
    const [nameFile, setNameFile] = React.useState("");
    const [pathFileSelectFolder, setPathFileSelectFolder] = React.useState("");
    const [openDialog, setOpenDialog] = React.useState(false);

    const handleClickOpenDialog = () => {
      setOpenDialog(true);
    };
  
    const handleCloseDialog  = () => {
      setOpenDialog(false);
    };

    const onClickSelectFile = (files) => {
        if (files[0]) {
            setSelectFile(files[0])
            let name = files[0].name
            const nameIndex = name.indexOf('.')
            if (nameIndex != -1) name = name.substring(0, nameIndex)
            name = name.replaceAll('-', '_')
            name = name.replaceAll(' ', '_')
            setNameFile(name)
            let img = new Image()
            img.src = window.URL.createObjectURL(files[0])
            img.onload = () => {
                setSizeImageText(img.width + "x" + img.height)
            }
        }
    }

    const onClickDeleteFile = (files) => {
        setSizeImageText("")
        setNameFile("")
    }

    const onClickSelectFolder = (event) => {
      ipcRenderer.send('app:open:location')
      ipcRenderer.on('app:close:location', (event, data) => {
        setPathFileSelectFolder(data)
      })
    }
    const onClickSaveFile = (event) => {
      const pathImage = selectFile.path
      ipcRenderer.send('app:open:save',pathFileSelectFolder, pathImage)
      ipcRenderer.on('app:close:save', (event, data) => {
        handleClickOpenDialog();
      })
    }
    return (
        <React.Fragment>
            <div>
                <title>Make Application Icon</title>
                <Container fixed >
                    <Grid
                        container
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="center"
                    >
                        <h1>Make Application Icon</h1>
                        
                        <Box height={20}/>
                        <div className={classes.rowStart}>
                        <h3 className={classes.textHiden}>Require image file 1536x1536, File type png.</h3>
                        </div>
                        <Grid
                            container
                            direction="column"
                            justifyContent="flex-start"
                            alignItems="flex-start"
                        >
                            <div className={classes.rowStart}>
                              <h4>Location file save: {pathFileSelectFolder}</h4>
                            </div>
                            <Button
                                variant="outlined" color="primary"
                                onClick={
                                    (e) => onClickSelectFolder(e)
                                }>
                                Select Folder
                            </Button>

                        </Grid>
                        <Box height={10}/>
                        <DropzoneArea
                            acceptedFiles={['image/png']}
                            filesLimit={1}
                            dropzoneText={"Drag and drop an image here or click"}
                            onChange={(files) => onClickSelectFile(files)}
                            onDelete={(files) => onClickDeleteFile(files)}
                        />
                        <Grid
                            container
                            direction="row"
                            justifyContent="flex-start"
                            alignItems="center"
                        >
                            <h4>Size Image {sizeImageText}</h4>
                        </Grid>
                        <Grid
                            container
                            direction="row"
                            justifyContent="flex-end"
                            alignItems="center"
                        >
                            <Button
                                variant="outlined" color="primary"
                                className={classes.button}
                                disabled={!(nameFile.length > 0 && pathFileSelectFolder.length > 0)}
                                onClick={
                                    (e) => onClickSaveFile(e)
                                }>
                                Save File
                            </Button>

                        </Grid>

                    </Grid>
                    <Dialog
                      open={openDialog}
                      onClose={handleCloseDialog}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        {"Save File OK"}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          {"SaveFile in location "+ pathFileSelectFolder+"/logo"}
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseDialog}>OK</Button>
                      </DialogActions>
                    </Dialog>
                </Container>
            </div>
        </React.Fragment>
    );
}

export default Home;
