// Authored preview stories. Live or student-specific content comes through the authorized server.
import catalog from "./room-directory.mjs";

const stories = [
  {lang:"fr", title:"Le billet de train", scene:"À la gare, Léa trouve un billet pour Lyon sur le banc. Le train part dans cinq minutes.",
    retryLabel:"Un indice, puis un nouvel essai",
    paths:[
      ["Interroger un voyageur", "Le voyageur a perdu un billet pour Lille. Quelles questions permettent de vérifier la destination sans lui montrer le billet ?", "Demandez où et à quelle heure il doit partir. Un autre voyageur arrive : vérifiez son trajet avec vos propres mots."],
      ["Aller au guichet", "L’agente demande où le billet a été trouvé. Racontez la scène, puis proposez une annonce sans donner le nom du voyageur.", "Précisez le lieu et l’heure. Cette fois, vous avez trouvé un sac à la bibliothèque : comment le signalez-vous ?"]
    ]},
  {lang:"en", title:"The last rehearsal", scene:"The school concert starts in ten minutes. A new student has the music but cannot find the rehearsal room.",
    retryLabel:"A hint and a fresh try",
    paths:[
      ["Give directions", "The usual corridor is closed. Describe another route using two landmarks, then check that the student can repeat it.", "Try one landmark at a time. Now the lift is closed too. Give the new route and invite the student to check it."],
      ["Ask a musician", "The musician is in a hurry. Ask for help politely, then explain the plan to the new student in your own words.", "Give the musician an easy way to decline. Now ask a busy stage manager for directions instead."]
    ]}
];

function storyStudio(t, escape) {
  return '<p>'+escape(t("chooseStory"))+'</p>'+stories.map(story =>
    '<details class="room-story"><summary lang="'+story.lang+'" dir="ltr">'+escape(story.title)+'</summary>'+
    '<p lang="'+story.lang+'" dir="ltr">'+escape(story.scene)+'</p><p>'+escape(t("storyTry"))+'</p>'+
    story.paths.map(([title,prompt,retry]) => '<details lang="'+story.lang+'" dir="ltr"><summary>'+escape(title)+'</summary><p>'+escape(prompt)+'</p>'+
      '<details><summary>'+escape(story.retryLabel)+'</summary><p>'+escape(retry)+'</p></details></details>').join("")+'</details>'
  ).join("");
}
export function roomDirectory(view,t,escape) {
  const body = catalog.rooms.filter(room => room.workspace === view).map(room => {
    const name = escape(t(room.experience));
    let activity = "";
    if (room.availability === "sample") {
      if (room.experience === "story") activity = storyStudio(t,escape);
      if (room.experience === "workshop") activity = '<p>'+escape(t("workshopNote"))+'</p><label>'+escape(t("workshopPrompt"))+
        '<textarea autocomplete="off" maxlength="1000" rows="3"></textarea></label>';
      if (room.experience === "evidence") activity = '<p>'+escape(t("evidenceCase"))+'</p><p>'+escape(t("evidenceNext"))+'</p>';
    }
    const status = escape(t(activity ? "sample" : "planned"));
    if (activity) return '<details class="room-entry" data-room="'+room.id+'"><summary>'+name+' · '+status+'</summary>'+activity+'</details>';
    return '<article class="room-entry" data-room="'+room.id+'"><h3>'+name+'</h3><p>'+status+'</p>'+
      (room.experience === "discussion" ? '<p>'+escape(t("plannedLive"))+'</p>' : '')+'</article>';
  }).join("");
  return '<section class="room-directory"><h2>'+escape(t("roomDirectory"))+'</h2>'+body+'</section>';
}
