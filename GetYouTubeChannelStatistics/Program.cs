//--------------------------------------------------------------//
// Program.cs
//
// Written by Robson
// <https://robson.plus>
//
// See the GitHub repository for licensing information.
// <https://github.com/Robson/Yogscast-YouTube-Statistics>
//--------------------------------------------------------------//

namespace GetYouTubeChannelStatistics
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Text.Json;
    using System.Threading;
    using System.Xml;
    using Google.Apis.Services;
    using Google.Apis.YouTube.v3;

    internal class Program
    {
        private const string PlaylistId = "UUH-_hzb2ILSCo9ftVSnrCIQ"; // yogscast "all videos" playlist. this id is public
        private const int YearStart = 2020;
        private const int YearFinal = 2020;
        private const int MaxVideoMetaDataResults = 50; // this is the maximum that the API allows

        private static string apiKey = File.ReadAllText("key.txt"); // to be able to use this code, you will need to replace this with your own key        
        private static List<string> videoIds = new List<string>();
        private static List<VideoData> videoDatas = new List<VideoData>();
        private static YouTubeService ytService = new YouTubeService(new BaseClientService.Initializer { ApiKey = apiKey });

        internal static void Main()
        {
            GetVideoIds();
            GetVideoDetails();
            SetSingleEpisodeSeries();
            WriteJson();
        }

        private static void GetVideoIds()
        {
            var service = ytService.PlaylistItems.List("contentDetails");
            service.MaxResults = MaxVideoMetaDataResults;
            service.PlaylistId = PlaylistId;

            var isFinished = false;
            do
            {
                var results = service.Execute();
                foreach (var video in results.Items)
                {
                    var year = ((DateTime)video.ContentDetails.VideoPublishedAt).Year;
                    if (year < YearStart)
                    {
                        isFinished = true;
                        break;
                    }
                    else if (year >= YearStart && year <= YearFinal)
                    {
                        videoIds.Add(video.ContentDetails.VideoId);
                    }
                }

                if (!isFinished)
                {
                    var nextPageToken = results.NextPageToken;
                    service.PageToken = nextPageToken;
                }
            }
            while (!isFinished);

            // just pause, so we don't overload the API with queries and then get blocked
            Thread.Sleep(1000);
        }

        private static void GetVideoDetails()
        {
            // there's lots of other details available, but we don't need those
            var service = ytService.Videos.List("contentDetails,snippet,statistics");

            for (int i = 0; i < videoIds.Count(); i += MaxVideoMetaDataResults)
            {
                service.Id = string.Join(",", videoIds.Skip(i).Take(MaxVideoMetaDataResults));
                foreach (var video in service.Execute().Items)
                {
                    var videoData = new VideoData
                    {
                        Id = video.Id,
                        PublishedDate = ((DateTime)video.Snippet.PublishedAt).ToString("yyyy-MM-dd"),
                        Title = video.Snippet.Title,
                        Description = video.Snippet.Description,
                        LengthInSeconds = (long)XmlConvert.ToTimeSpan(video.ContentDetails.Duration).TotalSeconds,
                        CountViews = video.Statistics.ViewCount ?? 0,
                        CountLikes = video.Statistics.LikeCount ?? 0,
                        CountDislikes = video.Statistics.DislikeCount ?? 0,
                        CountComments = video.Statistics.CommentCount ?? 0,
                        Tags = video.Snippet.Tags == null ? string.Empty : string.Join(",", video.Snippet.Tags)
                    };

                    videoData.PercentLikes = decimal.Round((decimal)videoData.CountLikes / (decimal)(videoData.CountLikes + videoData.CountDislikes), 5);
                    videoData.Series = SeriesParserYogscast.DetermineSeries(videoData);
                    videoDatas.Add(videoData);
                }
            }

            // just pause, so we don't overload the API with queries and then get blocked
            Thread.Sleep(1000);
        }

        private static void SetSingleEpisodeSeries()
        {
            foreach (var video in videoDatas)
            {
                var amount = videoDatas.Count(a => a.Series == video.Series);
                video.IsSingleEpisodeSeries = amount == 1;
            }
        }

        private static void WriteJson()
        {
            var json = JsonSerializer.Serialize<VideoData[]>(videoDatas.ToArray(), new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText("data.json", "var stats = " + json);
        }
    }
}