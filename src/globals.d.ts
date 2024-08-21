import SBObject from "./config";
declare global {
    interface Window {
        SB: typeof SBObject;
        __INITIAL_STATE__?: { bvid: string; upInfo: { mid: number } };
        __playinfo__?: { data: { quality: number; dash: { video: { id: number; frameRate: number }[] } } };
    }
}
