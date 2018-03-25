import React from 'react'
import axios from 'axios'
import './style.css'

class Tournament extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
        Teams : [],
        teamsPerRound : []
    }
  }

  componentWillMount(){
    this.fetchData('https://raw.githubusercontent.com/bttmly/nba/master/data/teams.json',
    (data)=>{

      let teamsPerRound = this.state.teamsPerRound
      teamsPerRound.push(data)
      this.setState({Teams: data, teamsPerRound : teamsPerRound},()=>{
        this.Play(this.state.Teams);
      })
    })
  }

  Play(teams)
  {
    let teamsPerRound = this.state.teamsPerRound

    let group1 = []
    let group2 = []
    let winners = []
    let runnerUps = []

    //Divide teams in 2 groups
    this.createGroups(teams, group1, group2);

    //Game Play to decide winners and RunnerUps for that round
    this.PlayMatches(teams, group1, group2, winners, runnerUps)

    //to PassByValue
    let winnersOfRound = JSON.parse(JSON.stringify(winners))

    //Record the teams qualified for next round
    teamsPerRound.push(winnersOfRound)
    this.setState({teamsPerRound : teamsPerRound})

    //Recursive call for each round of game
    if(winners.length > 1)
        this.Play(winnersOfRound)
  }

  createGroups(teams, group1, group2){
    for(let team in teams)
    {
      teams[team].isWinner = false;

      if(team % 2 == 0)
        group1.push(teams[team])
      else {
        group2.push(teams[team])
      }
    }
  }

  PlayMatches(teams, group1, group2, winners, runnerUps){
    for(let idx in group1)
    {
      let result = 1
      /* if  odd no of teams in round,
            then last team will be declared winner by default for that round
         else calculate Winner by random calculator
      */

      if(group2[idx] == undefined)
        result = 1
      else
        result = Math.floor((Math.random() * 2) + 1)

      if(result == 1)
      {
        winners.push(group1[idx])
        runnerUps.push(group2[idx])
      }
      else
      {
        winners.push(group2[idx])
        runnerUps.push(group1[idx])
      }

      //set 'isWinner' flag to true for that round
      teams.find((obj)=>{return obj.teamId == (winners[winners.length-1]).teamId}).isWinner = true
    }

  }



  fetchData(URL, success)
  {
    axios({
    method:'get',
    url: URL,
    responseType:'text/json',
    })
    .then((response)=>{
      var data = response.data
        success(data);
    })

  }


  teamsComponent(teams, idx, teamHeight)
  {

    return teams.map((team, index)=>{
                                {/*If there is Buy for one team in previous round then same team will be play for this round*/}
                                teamHeight = (idx > 0 && (index == (teams.length - 1)) && (((this.state.teamsPerRound[idx - 1]).length % 2) != 0)) ? teamHeight/2 : teamHeight

                                 return(
                                   <tr key={index} style={{height : teamHeight}}>
                                     <td  className="team" >
                                         {
                                           (teams.length == 1)
                                           ?
                                             <img src='./trophy.png' height ='250px' style={{padding : '20px'}}/>
                                           :
                                             null
                                         }
                                        <div className = {(team.isWinner) ? 'winner' : 'runnerUp'} style={(teams.length == 1) ? {fontWeight : 'bold', fontSize : '20px'} : null}>
                                          {team.teamName + ' ('+team.abbreviation+')'}
                                        </div>

                                     </td>
                                   </tr>
                                 )

                               })

  }

  getRoundName(idx)
  {

    switch(idx)
    {
      case 1:
        return 'Knockout Round'

      case 2:
        return 'Quarter Finals'

      case 3:
        return 'Semi Finals'

      case 4:
        return 'Finals'

      case 5:
        return 'Winner'

      default :
        return 'Teams'
    }
  }

  getNotations()
  {
    return(
      <span style={{display : 'inline-flex'}}>
        <div className='Winner'><b>Winners</b></div>&nbsp; &nbsp; &nbsp; &nbsp;
        <div className='runnerUp'><b>Runner Ups</b></div>
      </span>
    )
  }



  render()
  {
    let teamHeight = 25;
    return(
      <div className='container'>
          <h1 className='title'><u>FIFA Worldcup Brasil</u></h1>

          {this.getNotations()}

          <table style={{padding : '30px'}}>
          <tr>
          {
            this.state.teamsPerRound.map((teams, idx)=>{
                        teamHeight = (teamHeight * 2)
                        return(
                          <td key={idx} style={{verticalAlign : 'top'}}>
                              <table style={{width : '250px'}}>
                                  <tr>
                                    <td style={{textAlign : 'center', borderBottom : '1px solid green', color : 'skyblue'}}>
                                        <h3>{this.getRoundName(idx)}</h3>
                                    </td>
                                  </tr>
                                  {this.teamsComponent(teams, idx, teamHeight)}
                              </table>
                          </td>
                        )

                    })
          }
          </tr>
          </table>
      </div>
    )
  }


}

export default Tournament;
