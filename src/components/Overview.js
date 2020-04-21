import React, { Component } from "react";
import DisplayPanels from "./DisplayPanels";
import axios from "axios";
import { withStyles } from "@material-ui/styles";
import colors from "../colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const styles = {
  root: {
    textAlign: "center",
  },
  panels: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    border: "none",
    backgroundColor: colors.purple,
    padding: "1.5rem 3rem",
    color: "#fff",
    borderRadius: "10rem",
    fontFamily: "inherit",
    fontSize: "1.6rem",
    marginTop: "6rem",
    transition: "all .2s",
    boxShadow: "0 1.5rem 2.5rem rgba(0,0,0,.2)",

    "&:hover": {
      backgroundColor: colors.darkPurple,
      boxShadow: "0 .5rem 1rem rgba(0,0,0,.2)",
      outline: "none",
      border: "none",
    },

    "&:focus": {
      border: "none",
      outline: "none",
    },

    "&:hover svg": {
      animationName: "$rotation",
      animationDuration: "1s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
    },
  },

  // refreshIcon: {
  //   marginRight: "1rem",
  // },

  refreshIcon: {
    fontSize: "10rem",
    animationName: "$rotation",
    animationDuration: "1s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },

  loadingIcon: {
    height: "50vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  "@keyframes rotation": {
    from: {
      transform: "rotate(0deg)",
    },
    to: {
      transform: "rotate(359deg)",
    },
  },
};

class Overview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDay: {},
      previousDay: {},
      dataChanges: {},
      isLoading: false,
    };
    this.calculateChange = this.calculateChange.bind(this);
    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    this.setState({ isLoading: !this.state.isLoading });
    const response = await axios.get(
      "https://api.rootnet.in/covid19-in/stats/history"
    );
    const data = response.data.data.slice(-2);
    const previousDay = data[0].summary;
    const currentDay = data[1].summary;
    this.setState(
      {
        previousDay: {
          confirmed: previousDay.total,
          recovered: previousDay.discharged,
          deaths: previousDay.deaths,
          activeCases:
            previousDay.total - (previousDay.discharged + previousDay.deaths),
        },
        currentDay: {
          confirmed: currentDay.total,
          recovered: currentDay.discharged,
          deaths: currentDay.deaths,
          activeCases:
            currentDay.total - (currentDay.discharged + currentDay.deaths),
        },
      },
      this.calculateChange
    );
  }

  calculateChange() {
    const { previousDay, currentDay, isLoading } = this.state;
    let newObj = Object.keys(currentDay).reduce((a, k) => {
      a[k] = currentDay[k] - previousDay[k];
      return a;
    }, {});
    this.setState({ dataChanges: newObj, isLoading: !isLoading });
  }

  render() {
    const { confirmed, recovered, deaths, activeCases } = this.state.currentDay;
    const dataChange = this.state.dataChanges;
    const { classes } = this.props;
    const { isLoading } = this.state;

    if (isLoading) {
      return (
        <div className={classes.loadingIcon}>
          <FontAwesomeIcon icon={faSyncAlt} className={classes.refreshIcon} />
        </div>
      );
    }

    return (
      <div className={classes.root}>
        <div className={classes.panels}>
          <DisplayPanels
            title="Confirmed"
            number={confirmed}
            dataChange={dataChange.confirmed}
          />
          <DisplayPanels
            title="Active"
            number={activeCases}
            dataChange={dataChange.activeCases}
          />
          <DisplayPanels
            title="Recovered"
            number={recovered}
            dataChange={dataChange.recovered}
          />
          <DisplayPanels
            title="Deceased"
            number={deaths}
            dataChange={dataChange.deaths}
          />
        </div>

        <button className={classes.button} onClick={this.fetchData}>
          {/* <FontAwesomeIcon icon={faSyncAlt} className={classes.refreshIcon} /> */}
          Update Results
        </button>
      </div>
    );
  }
}

export default withStyles(styles)(Overview);
