import clsx from "clsx";
import ReactPlayer from "react-player/file";
import { Reducer, useCallback, useReducer, useRef } from "react";
import { debounce, throttle } from "lodash-es";

import NextButton from "./controls/SkipControl";
import FullscreenButton from "./controls/FullscreenControl";
import Settings from "./controls/Settings";
import PauseButton from "./controls/PauseControl";
import VolumeButton from "./controls/VolumeControl";

import Sections from "@routes/course/watch/Sections";
import Description from "@routes/course/watch/Description";

const initialState = {
  playing: false,
  volume: 1,
  quality: "360p",
  speed: 1,
  progress: 0,
  loaded: 0,
  duration: 0,
  hideControls: false,
};

const reducer: Reducer<
  typeof initialState,
  { type: "UPDATE" | "PLAY/PAUSE"; payload: Partial<typeof initialState> }
> = (state, action) => {
  switch (action.type) {
    case "PLAY/PAUSE":
      return { ...state, playing: !state.playing };
    default:
      return {
        ...state,
        ...action.payload,
      };
  }
};

export default function VideoPlayer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const playerContainer = useRef<HTMLDivElement>(null);
  const videoElement = useRef<ReactPlayer>(null);

  const formatter = new Intl.DateTimeFormat("pt-BR", { minute: "2-digit", second: "2-digit" });

  const seekTo = (percentage: number) => {
    videoElement.current!.seekTo(percentage, "fraction");
  };

  const showControls = useCallback(
    throttle(() => dispatch({ type: "UPDATE", payload: { hideControls: false } }), 3500, { trailing: false }),
    []
  );
  const hideControls = useCallback(
    debounce(() => dispatch({ type: "UPDATE", payload: { hideControls: true } }), 3500),
    []
  );

  return (
    <div className="flex flex-col gap-4 my-10 lg:flex-row">
      <div className="w-full flex flex-col lg:w-8/12">
        <div
          ref={playerContainer}
          onClick={() => dispatch({ type: "PLAY/PAUSE", payload: {} })}
          onMouseEnter={() => dispatch({ type: "UPDATE", payload: { hideControls: false } })}
          onMouseLeave={() => dispatch({ type: "UPDATE", payload: { hideControls: true } })}
          onMouseMove={() => {
            showControls();
            hideControls();
          }}
          className={clsx(["w-full bg-black aspect-video relative", state.hideControls && "cursor-none"])}
        >
          <ReactPlayer
            ref={videoElement}
            width="100%"
            height="100%"
            playing={state.playing}
            volume={state.volume}
            playbackRate={state.speed}
            progressInterval={500}
            onProgress={({ played, loaded }) => {
              dispatch({ type: "UPDATE", payload: { progress: played, loaded } });
            }}
            onDuration={(duration) => dispatch({ type: "UPDATE", payload: { duration } })}
            url="/Card%20Evolution%20Reveal!%20(music%20by%20Tenacious%20D!)%20[6fo9gJ2nFdU].mp4"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className={clsx(["absolute z-0 bottom-0 w-full px-3 py-4", state.hideControls ? "hidden" : "block"])}
          >
            <div className="w-full h-1 mb-3 bg-gray-600 relative flex items-center group">
              <div className="absolute h-full bg-gray-400" style={{ width: `${state.loaded * 100}%` }}></div>
              <div className="absolute h-full bg-blue-600" style={{ width: `${state.progress * 100}%` }}></div>
              <input
                type="range"
                min={0}
                max={1}
                value={state.progress}
                step={0.001}
                onChange={(e) => seekTo(+e.target.value)}
                className="absolute w-full h-2 bg-[#00000000] appearance-none cursor-pointer outline-none hidden group-hover:block"
              />
            </div>
            <div className="flex w-full items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <PauseButton state={state} dispatch={dispatch} />
                <NextButton />
                <VolumeButton state={state} dispatch={dispatch} />
                <p className="text-white">
                  {formatter.format(state.duration * state.progress * 1000)} / {formatter.format(state.duration * 1000)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Settings state={state} dispatch={dispatch} />
                <FullscreenButton player={playerContainer} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h1 className="mt-3 font-bold text-lg">Titulo do video</h1>
          <Description />
        </div>
      </div>
      <Sections />
    </div>
  );
}
