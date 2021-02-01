//--------------------------------------------------------------//
// VideoData.cs
//
// Written by Robson
// <https://robson.plus>
//
// See the GitHub repository for licensing information.
// <https://github.com/Robson/Yogscast-YouTube-Statistics>
//--------------------------------------------------------------//

namespace GetYouTubeChannelStatistics
{
    internal class VideoData
    {
        public string Id { get; set; }

        public string PublishedDate { get; set; }

        public string Title { get; set; }

        public long LengthInSeconds { get; set; }

        public ulong CountViews { get; set; }

        public ulong CountLikes { get; set; }

        public ulong CountDislikes { get; set; }

        public ulong CountComments { get; set; }

        public decimal PercentLikes { get; set; }

        public string Series { get; set; }

        public bool IsSingleEpisodeSeries { get; set; }

        internal string Description { get; set; }

        internal string Tags { get; set; }
    }
}
