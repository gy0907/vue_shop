export default function dateFormat(date, format = "YYYY-MM-DD hh:mm:ss") {
    date = new Date(date) // 这样就可以直接传入一个时间戳 
    const config = {
      YYYY: date.getFullYear(),
      MM: date.getMonth()+1,
      DD: date.getDate(),
      hh: date.getHours() < 10 ? '0' + date.getHours() : date.getHours() ,
      mm: date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() ,
      ss: date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds() 
    };
    for (const key in config) { // key是config中的所有项
      // 将format中的关键字中的key替换为相应的实际日期
      format = format.replace(key, config[key]);
    }
    return format;
  }
