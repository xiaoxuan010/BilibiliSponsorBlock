import Config from "../config";

/**
 * 解析弹幕文本中的目标时间
 *
 * @param text 输入需要解析的弹幕文本
 * @param currentTime 弹幕出现的时间
 * @returns 返回弹幕指向目标时间。若无法解析，则会返回null。
 */
export function parseTargetTimeFromDanmaku(text: string, currentTime: number) {
    function parseTime(text: string) {
        const regex = new RegExp(Config.config.danmakuTimeMatchingRegexPattern, "g");

        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
            const [fullMatch, hours, minutes, seconds, secondsSuffix] = match;

            if (seconds && (secondsSuffix || minutes)) {
                let hours = parseInt(match[1] || "0");
                let minutes = parseInt(match[2] || "0");
                let seconds = parseInt(match[3] || "0");
                return hours * 3600 + minutes * 60 + seconds;
            }
        }

        return null;
    }

    function parseOffsetTime(text: string) {
        const regex = new RegExp(Config.config.danmakuOffsetMatchingRegexPattern, "g");

        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
            const [fullMatch, direction, offset, suffix] = match;

            if (offset && (direction || suffix)) {
                // “向右x下”等价于当前时间 + 5x秒
                return parseInt(offset) * 5;
            }
        }

        return null;
    }

    text = text.replace(/[零一二三四五六七八九两壹贰叁肆伍陆柒捌玖十百千万]+/g, (cnNum) => parseChineseNumber(cnNum));

    let directParsedTime = parseTime(text);
    if (directParsedTime) return directParsedTime;
    else {
        let offsetParsedTime = parseOffsetTime(text);
        if (offsetParsedTime) return offsetParsedTime + currentTime;
    }
    return null;
}

export function parseChineseNumber(text: string) {
    let cnChrMap = {
        零: 0,
        一: 1,
        二: 2,
        三: 3,
        四: 4,
        五: 5,
        六: 6,
        七: 7,
        八: 8,
        九: 9,
        两: 2,
        壹: 1,
        贰: 2,
        叁: 3,
        肆: 4,
        伍: 5,
        陆: 6,
        柒: 7,
        捌: 8,
        玖: 9,
    };

    let cnUnitMap = {
        十: 10,
    };

    let num = 0;
    let unit = 1;
    let lastUnit = 1;
    for (let i = 0; i < text.length; i++) {
        let chr = text[i];
        if (chr in cnChrMap) {
            num += cnChrMap[chr] * unit;
        } else if (chr in cnUnitMap) {
            unit = cnUnitMap[chr];
            if (unit < lastUnit) {
                num += 1;
            }
            num = num * unit;
            unit = 1;
            lastUnit = unit;
        } else {
            return "Error";
        }
    }

    return num.toString();
}
