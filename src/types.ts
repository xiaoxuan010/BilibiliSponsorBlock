import SubmissionNotice from "./render/SubmissionNotice";
import SkipNoticeComponent from "./components/SkipNoticeComponent";
import SkipNotice from "./render/SkipNotice";

export interface ContentContainer {
    (): {
        vote: (type: number, UUID: SegmentUUID, category?: Category, skipNotice?: SkipNoticeComponent) => void,
        dontShowNoticeAgain: () => void,
        unskipSponsorTime: (segment: SponsorTime) => void,
        sponsorTimes: SponsorTime[],
        sponsorTimesSubmitting: SponsorTime[],
        skipNotices: SkipNotice[],
        v: HTMLVideoElement,
        sponsorVideoID,
        reskipSponsorTime: (segment: SponsorTime) => void,
        updatePreviewBar: () => void,
        onMobileYouTube: boolean,
        sponsorSubmissionNotice: SubmissionNotice,
        resetSponsorSubmissionNotice: () => void,
        changeStartSponsorButton: (showStartSponsor: boolean, uploadButtonVisible: boolean) => Promise<boolean>,
        previewTime: (time: number, unpause?: boolean) => void,
        videoInfo: VideoInfo,
        getRealCurrentTime: () => number
    }
}

export interface FetchResponse {
    responseText: string,
    status: number,
    ok: boolean
}

export interface VideoDurationResponse {
    duration: number;
}

export enum CategorySkipOption {
    ShowOverlay,
    ManualSkip,
    AutoSkip
}

export interface CategorySelection {
    name: Category;
    option: CategorySkipOption
}

export enum SponsorHideType {
    Visible = undefined,
    Downvoted = 1,
    MinimumDuration
}

export enum CategoryActionType {
    Skippable = "", // Strings are used to find proper language configs
    POI = "_POI"
}

export type SegmentUUID = string  & { __segmentUUIDBrand: unknown };
export type Category = string & { __categoryBrand: unknown };

export interface SponsorTime {
    segment: number[];
    UUID: SegmentUUID;

    category: Category;

    hidden?: SponsorHideType;
}

export interface PreviewBarOption {
    color: string,
    opacity: string
}


export interface Registration {
    message: string,
    id: string,
    allFrames: boolean,
    js: browser.extensionTypes.ExtensionFileOrCode[],
    css: browser.extensionTypes.ExtensionFileOrCode[],
    matches: string[]
}

export interface BackgroundScriptContainer {
    registerFirefoxContentScript: (opts: Registration) => void,
    unregisterFirefoxContentScript: (id: string) => void
}

export interface VideoInfo {
    responseContext: {
        serviceTrackingParams: Array<{service: string, params: Array<{key: string, value: string}>}>,
        webResponseContextExtensionData: {
            hasDecorated: boolean
        }
    },
    playabilityStatus: {
        status: string,
        playableInEmbed: boolean,
        miniplayer: {
            miniplayerRenderer: {
                playbackMode: string
            }
        }
    };
    streamingData: unknown;
    playbackTracking: unknown;
    videoDetails: {
        videoId: string,
        title: string,
        lengthSeconds: string,
        keywords: string[],
        channelId: string,
        isOwnerViewing: boolean,
        shortDescription: string,
        isCrawlable: boolean,
        thumbnail: {
            thumbnails: Array<{url: string, width: number, height: number}>
        },
        averageRating: number,
        allowRatings: boolean,
        viewCount: string,
        author: string,
        isPrivate: boolean,
        isUnpluggedCorpus: boolean,
        isLiveContent: boolean,
    };
    playerConfig: unknown;
    storyboards: unknown;
    microformat: {
        playerMicroformatRenderer: {
            thumbnail: {
                thumbnails: Array<{url: string, width: number, height: number}>
            },
            embed: {
                iframeUrl: string,
                flashUrl: string,
                width: number,
                height: number,
                flashSecureUrl: string,
            },
            title: {
                simpleText: string,
            },
            description: {
                simpleText: string,
            },
            lengthSeconds: string,
            ownerProfileUrl: string,
            externalChannelId: string,
            availableCountries: string[],
            isUnlisted: boolean,
            hasYpcMetadata: boolean,
            viewCount: string,
            category: Category,
            publishDate: string,
            ownerChannelName: string,
            uploadDate: string,
        }
    };
    trackingParams: string;
    attestation: unknown;
    messages: unknown;
}

export type VideoID = string;

export type StorageChangesObject = { [key: string]: chrome.storage.StorageChange };

export type UnEncodedSegmentTimes = [string, SponsorTime[]][];