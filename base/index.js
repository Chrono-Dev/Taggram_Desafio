/* author: Isaac Vinícius  gihub: Chrono-Dev*/
(function(apiUrl) {
    function getMe(send) {                //Cria o usuário 
       return fetch(apiUrl + "/me")
       .then(function(response) {
          return response.json();
        })
      .then(function(user) {
          const $username = document.getElementById("current-user-username");
          const $avatar = document.getElementById("current-user-avatar");

          $username.innerHTML = user.username;

          if (user.avatar) {
            $avatar.style.backgroundImage = "url('" + user.avatar + "')";
          }
          return user;//Retorna o user para ser utilizado no envio de comentários(username, photo)
      })
      .catch(error => {
        alert("Erro ao receber dados do Usuário"+ "\r\n" +  error);
        });
      
    }

 
    //Função para enviar comentários 
    function send(user,post,message) {
        const request = new Request(apiUrl + "/posts/"+post.uuid+"/comments", {
        method: 'POST',
        body:JSON.stringify({username: user.username, message: message}),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
      });
      
     function handleErrors(response) {
        if (!response.ok) throw new Error(response.status);
        return response;
      }  
        fetch(request)
       .then(res => handleErrors(res))
       .then(res => res.json())
       .then(res => { 
        document.getElementById("current-post-enterM").value = "";    //Limpa o input quando tem certeza que não deu erro
        populateComments(res)})                                      //assim o usuário não perde o conteúdo da mensagem
       .catch(error => {
         alert("Comentário não foi enviado, tente novamente");
         });
    }

    

//implementação da postagem
    function getPost() {
       return fetch(apiUrl + "/post")
       .then(function(response) {
          return response.json();
        })
       .then(function(post){
          const $username =  document.getElementById("current-post-user-username");
          $username.innerHTML = post.user.username;  //username

          const $photo = document.getElementById("current-post-photo");
          $photo.style.backgroundImage = "url('" + post.photo + "')";  //foto de fundo

          const $avatar   =  document.getElementById("current-post-user-avatar");
          if(post.user.avatar)   //foto de avatar 
          {
              $avatar.style.backgroundImage = "url('" + post.user.avatar + "')";
          }


          const $location = document.getElementById("current-post-user-location");
          $location.innerHTML = post.location.city + "," + post.location.country; //localização 

          const $date     = document.getElementById("current-post-date");
          //ajeitando o horário atual  
          var data = post.created_at.split("T");  //separando o texto para conseguir o ano, mês e o dia
          data     = data[0].split("-");

          var year = data[0];
          var month= data[1];
          var   day= data[2];
    
          //definindo o texto de data na postagem
          $date.innerHTML = day + " DE " + new Date(year,month,day).toLocaleString('default', {month:'long'});
            
        //Preenchendo os comentários do posts
         populateComments(post.comments);

          var parent = document.getElementById('current-post-content-commentsContainer');  //para habilitar scroll entre as mensagens
          var child = document.getElementById('current-post-content-comments');           //sem o scroll aparecer na tela 
          child.style.paddingRight = child.offsetWidth - child.clientWidth + "px";
          document.getElementById('current-post-enterM').value = '';                      //Reseta o valor do input(comentário)

          
          return post;//Retorna o  post para ser utilizado no envio de comentários(uuid)
      })
      .catch(error => {
        alert("Erro ao receber dados da Postagem" + "\r\n" +  error);
        });
      

}
  


  function initialize() {
     var user;                      //Cria as variáveis que vão ser utilizadas como post e user 
     getMe().then(u => user = u);   // que vão ser usados posteriormente na criação de  comentários
     var post;
     getPost().then(p => post = p);
     
    
     //Envio de comentários pelo enter e botão enviar 
     document.addEventListener("keyup", function(event) {         
      if (event.keyCode === 13) 
      {
        enviarMensagem();
      }
     });

    document.getElementById("current-post-enter").onclick = enviarMensagem;   

     function enviarMensagem()   ///Envia o comentário se existe algum texto para ser enviado 
     {
        var message = document.getElementById("current-post-enterM").value;
        var scroll = document.getElementById("current-post-content-comments");   
        if(message.value != "" && message.replace(/\s/g, '').length)  
        {
          send(user,post,message);         
          scroll.scrollTop = scroll.scrollHeight ;           //Posiciona a visão dos comentários nos mais recentes
        }
     }
  
}


 

 

  function populateComments(comments)
  {
    
    //Pegando a rdata atual e o hoário limite do dia
    //Não é possível pegar o horário atual pois alguns comentários criados pela API tem horários de criação após o atual
    //gerando uma diferença de horária negativa
    var today =  new Date();
    var a = new Date(parseInt(today.getFullYear()),today.getMonth(),today.getDate(),23, 59); 
    var b;

  

    var container = document.getElementById("current-post-content-comments");
    container.innerHTML = "";

    document.getElementById("current-post-qtd").innerHTML = comments.length + " Comentários";

    comments.forEach(function populate(comment)
    {
      
      var div = document.createElement('div');   //cria a div que contém as informações 
      div.className = 'comment';

      var photo = document.createElement('div');  //foto de perfil 
      photo.className = 'comment_photo';
    
      var content = document.createElement('div');  //conteudo da mensagem( Nome +  comentário)
      content.className = 'comment_content';

      var time = document.createElement('div');  //texto do tempo da postagem 
      time.className = 'comment_time';

      photo.style.backgroundImage = "url('" + comment.user.avatar + "')"
      content.innerHTML = "<b>" + comment.user.username  + "</b> " + comment.message;

      //Separar os dados do created_at em ano, mês, dia e hora
      var data = comment.created_at.split("T");  
      var horario  = data[1].split(":");
      data     = data[0].split("-");

      b = new Date(data[0],data[1]-1,data[2],horario[0],horario[1]);

      //diferença entre o horário do usuário e dos comentários 
      var  hh = Math.ceil(parseInt(a.getHours()) - parseInt(b.getHours()));
      var mm  = Math.ceil(parseInt(a.getMinutes()) - parseInt(b.getMinutes()));
      var dd = Math.ceil(parseInt(a.getUTCDate()-1) - parseInt(b.getUTCDate()));

      
      
    

      //escrita dos horários 
      if(dd >= 1)
        time.innerHTML = dd + "d" + hh + "h"
      else
          if(hh == 0)
          {
            if(mm == 0)
              time.innerHTML = "agora mesmo"
            else
              time.innerHTML = mm + "m";
          }
       else
        time.innerHTML = hh + "h";
      
      div.innerHTML += photo.outerHTML;
      div.innerHTML += content.outerHTML;
      div.innerHTML += time.outerHTML;
      container.innerHTML += div.outerHTML;

    });

  }
    
  initialize();
})("https://taggram.herokuapp.com");
