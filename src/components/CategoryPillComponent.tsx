import * as React from "react";
import Config from "../config";
import { Category, SegmentUUID, SponsorTime } from "../types";

import { VoteResponse } from "../messageTypes";
import { showMessage } from "../render/MessageNotice";
import PersistedTooltip from "../render/PersistedTooltip";
import ThumbsDownSvg from "../svg-icons/thumbs_down_svg";
import ThumbsUpSvg from "../svg-icons/thumbs_up_svg";
import { waitFor } from "../utils/";
import { AnimationUtils } from "../utils/animationUtils";
import { getErrorMessage } from "../utils/formating";
import { downvoteButtonColor, SkipNoticeAction } from "../utils/noticeUtils";

export interface CategoryPillProps {
    vote: (type: number, UUID: SegmentUUID, category?: Category) => Promise<VoteResponse>;
    showTextByDefault: boolean;
    showTooltipOnClick: boolean;
}

export interface CategoryPillState {
    segment?: SponsorTime;
    show: boolean;
    open?: boolean;
}

class CategoryPillComponent extends React.Component<CategoryPillProps, CategoryPillState> {
    tooltip?: PersistedTooltip;

    constructor(props: CategoryPillProps) {
        super(props);

        this.state = {
            segment: null,
            show: false,
            open: false,
        };

        waitFor(() => document.querySelector("#viewbox_report").childNodes[1], 10000)
            .then(() => {
                const tooltipMount = document.querySelector("#viewbox_report") as HTMLElement;
                this.tooltip = new PersistedTooltip({
                    text: this.getTitleText(),
                    referenceNode: tooltipMount,
                    bottomOffset: "unset",
                    topOffset: "4px",
                    opacity: 0.95,
                    displayTriangle: false,
                    showLogo: false,
                    showGotIt: false,
                    prependElement: tooltipMount.childNodes[1] as HTMLElement,
                    elements: [
                        <>
                            <div className="voteRequestContainer sponsorSkipObject">
                                <span>{chrome.i18n.getMessage("requestVote")}</span>
                                <div
                                    className="voteButton"
                                    title={chrome.i18n.getMessage("upvote")}
                                    onClick={(e) => this.vote(e, 1)}
                                >
                                    <ThumbsUpSvg fill={Config.config.colorPalette.white} />
                                    <span>{chrome.i18n.getMessage("upvote")}</span>
                                </div>
                                <div
                                    className="voteButton"
                                    title={chrome.i18n.getMessage("reportButtonInfo")}
                                    onClick={(e) => this.vote(e, 0)}
                                >
                                    <ThumbsDownSvg fill={downvoteButtonColor(null, null, SkipNoticeAction.Downvote)} />
                                    <span>{chrome.i18n.getMessage("downvote")}</span>
                                </div>
                            </div>
                        </>,
                    ],
                });
            })
            .catch(() => {
                console.warn("等待查找category tooltip 挂载点时超时");
            });
    }

    render(): React.ReactElement {
        const style: React.CSSProperties = {
            backgroundColor: this.getColor(),
            display: this.state.show ? "flex" : "none",
            color: this.getTextColor(),
        };

        return (
            <span
                style={style}
                className={"sponsorBlockCategoryPill" + (!this.props.showTextByDefault ? " sbPillNoText" : "")}
                aria-label={this.getTitleText()}
                title=""
                onClick={(e) => this.toggleOpen(e)}
                onMouseEnter={() => this.openTooltip()}
                onMouseLeave={() => this.closeTooltip()}
            >
                <span className="sponsorBlockCategoryPillTitleSection">
                    <img
                        className="sponsorSkipLogo sponsorSkipObject"
                        src={chrome.runtime.getURL("icons/IconSponsorBlocker256px.png")}
                    ></img>

                    {(this.props.showTextByDefault || this.state.open) && (
                        <span className="sponsorBlockCategoryPillTitle">
                            {chrome.i18n.getMessage("category_" + this.state.segment?.category)}
                        </span>
                    )}
                </span>

                {this.state.open && (
                    <>
                        {/* Upvote Button */}
                        <div
                            id={"sponsorTimesDownvoteButtonsContainerUpvoteCategoryPill"}
                            className="voteButton"
                            style={{ marginLeft: "5px" }}
                            title={chrome.i18n.getMessage("upvoteButtonInfo")}
                            onClick={(e) => this.vote(e, 1)}
                        >
                            <ThumbsUpSvg fill={Config.config.colorPalette.white} />
                        </div>

                        {/* Downvote Button */}
                        <div
                            id={"sponsorTimesDownvoteButtonsContainerDownvoteCategoryPill"}
                            className="voteButton"
                            title={chrome.i18n.getMessage("reportButtonInfo")}
                            onClick={(event) => this.vote(event, 0)}
                        >
                            <ThumbsDownSvg fill={downvoteButtonColor(null, null, SkipNoticeAction.Downvote)} />
                        </div>
                    </>
                )}

                {/* Close Button */}
                <img
                    src={chrome.runtime.getURL("icons/close.png")}
                    className="categoryPillClose"
                    onClick={() => {
                        this.setState({ show: false });
                        this.closeTooltip();
                    }}
                ></img>
            </span>
        );
    }

    private toggleOpen(event: React.MouseEvent): void {
        event.stopPropagation();

        if (this.state.show) {
            if (this.props.showTooltipOnClick) {
                if (this.state.open) {
                    this.closeTooltip();
                } else {
                    this.openTooltip();
                }
            }

            this.setState({ open: !this.state.open });
        }
    }

    private async vote(event: React.MouseEvent, type: number): Promise<void> {
        event.stopPropagation();
        if (this.state.segment) {
            const stopAnimation = AnimationUtils.applyLoadingAnimation(event.currentTarget as HTMLElement, 0.3);

            const response = await this.props.vote(type, this.state.segment.UUID);
            await stopAnimation();

            if (response.successType == 1 || (response.successType == -1 && response.statusCode == 429)) {
                this.setState({
                    open: false,
                    show: type === 1,
                });

                this.closeTooltip();
            } else if (response.statusCode !== 403) {
                showMessage(getErrorMessage(response.statusCode, response.responseText), "warning");
            }
        }
    }

    private getColor(): string {
        // Handled by setCategoryColorCSSVariables() of content.ts
        const category = this.state.segment?.category;
        return category == null ? null : `var(--sb-category-preview-${category}, var(--sb-category-${category}))`;
    }

    private getTextColor(): string {
        // Handled by setCategoryColorCSSVariables() of content.ts
        const category = this.state.segment?.category;
        return category == null
            ? null
            : `var(--sb-category-text-preview-${category}, var(--sb-category-text-${category}))`;
    }

    private openTooltip(): void {
        this.tooltip?.open();
    }

    private closeTooltip(): void {
        this.tooltip?.close();
    }

    getTitleText(): string {
        const shortDescription = chrome.i18n.getMessage(`category_${this.state.segment?.category}_pill`);
        return (shortDescription ? shortDescription + ". " : "") + chrome.i18n.getMessage("categoryPillTitleText");
    }
}

export default CategoryPillComponent;
