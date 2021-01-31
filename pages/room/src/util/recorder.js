class Recorder{
    constructor(userName, stream){
        this.userName = userName;
        this.stream = stream;

        this.filename = `id:${userName}-when:${Date.now()}`;
        this.videoType = 'video/webm';

        this.mediaRecorder = {};
        this.recordedBlobs = [];
        this.completeRecordings = [];

        this.recordingActive = false;
    }

    _setup(){
        const commonCodecs = [
            "codecs=vp9,opus",
            "codecs=vp8,opus",
            ""
        ];

        const options = commonCodecs
            .map(codec => ({ mimetype: `${this.videoType};${codec}`}))
            .find(options => MediaRecorder.isTypeSupported(options.mimetype));


        if(!options) {
            throw new Error(`error of the codecs: ${commonCodecs.join(',')} are supported`);
        } 

        return options;
    }

    startRecording(){
        console.log("Clicou no start recording");
        const options = this._setup();
        //Se não tiver nada para mandar pela camera, então já era
        if(!this.stream.active) return;

        this.mediaRecorder = new MediaRecorder(this.stream, options);
        console.log(`Created MediaRecorder ${this.mediaRecorder} with options ${options}`);

        this.mediaRecorder.onstop = (event) => {
                console.log('Recorder blobs', this.recordedBlobs);
        }

        this.mediaRecorder.ondataavailable = (event) => {
            if(!event.data || !event.data.size) return;

            this.recordedBlobs.push(event.data);
        }


        this.mediaRecorder.start();
        console.log(`Media Recorded started`, this.mediaRecorder);

        this.recordingActive = true;


    }

    async stopRecording(){
        if(!this.recordingActive) return;
        if(this.mediaRecorder === "inactive") return;

        console.log(`media recorded stopped`, this.userName);

        this.mediaRecorder.stop();
        this.recordingActive = false;

        await Util.sleep(200);

        this.completeRecordings.push([...this.recordedBlobs]);
        this.recordedBlobs = [];

    }

    getAllVideosURLS(){
        return this.completeRecordings.map( recording => {
            const superBuffer = new Blob(recording, { type: this.videoType });

            return window.URL.createObjectURL(superBuffer);
        });

    }


    download(){
        if(!this.completeRecordings.length) return;

        for(const recording of this.completeRecordings){
            const blob = new Blob(recording, { type: this.videoType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = 'none';
            a.href = url;
            a.download = `${this.filename}.webm`;
            
            document.body.appendChild(a);

            a.click();
        }
    }


    // startRecording(){
    //     console.log('recording', this.userName, this.filename);
    // }
}