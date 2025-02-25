import { Howl } from 'howler';

export function setupAudio() {
    const sound = new Howl({
        src: ['./note1.mp3'],
        loop: false,
        volume: 1,
    });

    sound.on('load', () => console.log('Sound loaded!'));
    sound.on('loaderror', (error) => console.error('Error loading sound:', error));

    return sound;
}