/**
 * 1. Render song - check
 * 2. scroll top - check
 * 3. play/ pause / seek - check
 * 4. CD rotate - check
 * 5. next / prev - check
 * 6. random - check
 * 7. next / repeat when end - check
 * 8. active song - check 
 * 9. scroll active song into view  - check
 * 10. play song when click in playList - check
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);




const cd = $('.cd')

const heading = $('header h2')
const cbThumb = $('.cd-thumb')
const audio = $('#audio')

const playlist = $('.playlist')
const player = $('.player')
const playBtn = $('.btn-toggle-play')

const progress = $('#progress');

const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const PLAYER_STRORAGE_KEY = 'PLAYER 123'

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STRORAGE_KEY)) || {},
    songs: [
        {
            name: 'Blinding Lights',
            singer: 'The Weeknd',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.png'
        },

        {
            name: 'Save Your Tears',
            singer: 'The Weeknd',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpeg'
        },
        {
            name: 'Heat Waves',
            singer: 'Glass Animals',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.png'
        },
        {
            name: 'Head In The Clouds',
            singer: 'Hayd',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpeg'
        },
        {
            name: 'Counting Stars',
            singer: 'OneRepublic',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpeg'
        },
    ],

    //================= save player: btn repeat, random when click playlist =================
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STRORAGE_KEY, JSON.stringify(this.config)); // luu value sang string
    },


    //Render playlist
    render: function () {
        // ================= Render song - check ================= 
        const htmls = this.songs.map((song, index) => {
            return ` 
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        })
        playlist.innerHTML = htmls.join('');
    },

    //define porperties
    defineProperties: function () {
        // định nghĩa thuộc tính currentSong cho đối tượng hiện tại (app).
        Object.defineProperty(this, 'currentSong', { //currentSong ten thuoc tinh
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    //handle event DOM 
    handleEvent: function () {
        const _this = this; // vi` ham` this trong playbtn la ele btn chu khong phai la (app)
        const cdWidth = cd.offsetWidth //lay width cua cd
        // ================= scroll top - check ================= 
        // Zoom in/out CD 
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0 //if newCdWidth > 0 {newCdWidth + 'px'}
            cd.style.opacity = newCdWidth / cdWidth // chia ti le 200/200 = 1
        };


        // ================= play/ pause / seek - check ================= 
        //Handle when click play button
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        //when song is play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing')// add class playing to transfer pause > play
            cbThumbAnimate.play();  //vi gan mac dinh cbThumbAnimate.pause() 
            //khi play thi cbThumbAnimate se bat quay
        }
        //when song is pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing')// add class remove to transfer play > pause
            cbThumbAnimate.pause();
        }
        // when progress changes
        audio.ontimeupdate = function () {
            if (audio.duration) { //neu .duration khac 0 thi se tinh toan phan tram cho progress
                //tinh % cho thanh progress 
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent; // gan' cho thanh progress % chay 
                //console.log("time: " + audio.currentTime)
                //console.log("%: " + progressPercent)
            }
        }
        // rewind song
        progress.onchange = function () {
            const seekTime = audio.duration / 100 * progress.value
            // vi progress la % nen chuyen? audio.duration/100 sang % de tinh so giay
            audio.currentTime = seekTime
        }


        // ================= CD rotate play/pause - check ================= 
        const cbThumbAnimate = cbThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10 seconds 
            iterations: Infinity, // lap lai vo han
        })
        cbThumbAnimate.pause(); // cho mac dinh la pause 


        // ================= Button event next/prev song ================= 
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRadomSong();
            } else {
                _this.nextSong();
            }
            audio.play(); // play when click next song

            _this.render()// active song playList

            _this.scrollToActiveSong();// hieu ung active o playList

        }
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRadomSong();
            } else {
                _this.prevSong();
            }
            audio.play(); // play when click next song

            _this.render()// active song playList
            _this.scrollToActiveSong(); // hieu ung active o playList
        }


        // ================= Button event random song ================= 
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom; // false = true (! la phu nhan / dao nguoc )
            randomBtn.classList.toggle('active', _this.isRandom);
            // tham số thứ 2 = true thì sẽ thêm class active vào, false thì sẽ xoá class active

            //save config localStorage
            _this.setConfig('isRandom', _this.isRandom);
        }


        //================= repeat button =================
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat; // false = true
            repeatBtn.classList.toggle('active', _this.isRepeat); // true
            // tham số thứ 2 = true thì sẽ thêm class active vào, false thì sẽ xoá class active


            //save config localStorage
            _this.setConfig('isRepeat', _this.isRepeat);
        }


        // ================= Next song when ended ================= 
        audio.onended = function () {
            if (_this.isRepeat) { //  _this.isRepeat = true
                audio.play(); //  _this.isRepeat = true -> play song again
            }
            else {
                nextBtn.click(); // tu dong click khi het bai hat
            }
        }


        // ================= play song when click in playList =================
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');

            if (songNode || e.target.closest('.option')) {
                //xu ly khi click vao song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index) // dat data-index thi su dung ".dataset.index"
                    _this.loadCurrentSong();
                    audio.play()
                    _this.render();
                }

                //xu ly khi click vao song option
                if (e.target.closest('.option')) {

                }
            }
        }


    },


    // =================scroll active song into view=================
    scrollToActiveSong: function () {  // hieu ung active o playList
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }, 500)
    },


    //load first song when opening
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cbThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },


    // ================= create next / pre - check ================= 
    nextSong: function () {
        this.currentIndex++;
        // neu play bai cuoi cung thi se tro ve bai dau tien
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        // neu play bai dau tien cung thi se tro ve bai  cuoi 
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong();
    },

    // ================= create random - check ================= 
    playRadomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)
        //vòng lặp do while thực hiện 1 lần 
        //điều kiện nếu số randow mới = với số hiện tại 
        //thì sẽ lặp tiếp tìm số khác với hiện tại để chọn bài random không trùng

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    //load localStorage btn repeat - random
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },


    //Start
    start: function () {
        //load localStorage
        this.loadConfig();
        //handle DOM event
        this.handleEvent();
        //define properties
        this.defineProperties();
        //load first song when opening
        this.loadCurrentSong();


        //render playlist
        this.render();


        // hien thi trang thai ban dau cua  Repeat, Random
        repeatBtn.classList.toggle('active', this.isRepeat);
        randomBtn.classList.toggle('active', this.isRandom);

    },

}
app.start();